import time
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Team, Quest, TeamProgress, AnswerAttempt, ScoreEvent, EventConfiguration, PhysicalToken
from app.schemas import QuestPublic, AnswerSubmission, AnswerResult, TeamResponse
from app.security import normalize_and_hash_answer
from app.websocket.manager import manager

router = APIRouter(prefix="/player", tags=["player"])

def get_current_team(x_team_code: str = Header(...), db: Session = Depends(get_db)) -> Team:
    team = db.query(Team).filter_by(registration_code=x_team_code).first()
    if not team:
        raise HTTPException(status_code=401, detail="Invalid team session code")
    return team

@router.get("/me", response_model=TeamResponse)
def get_team_status(team: Team = Depends(get_current_team), db: Session = Depends(get_db)):
    if team.status == "RECOVERY" and time.time() >= team.lockout_until:
        team.status = "ACTIVE"
        team.lives = 1
        db.commit()
        db.refresh(team)
    return team

@router.get("/quest/current", response_model=QuestPublic)
def get_current_quest(team: Team = Depends(get_current_team), db: Session = Depends(get_db)):
    config = db.query(EventConfiguration).first()
    if config and config.event_status == "PAUSED":
        raise HTTPException(status_code=403, detail="THE HUNT HAS BEEN PAUSED BY THE GAME MASTER.")

    all_quests = db.query(Quest).order_by(Quest.order_index).all()
    if team.current_quest_index >= len(all_quests):
        raise HTTPException(status_code=400, detail="All quests have been completed.")

    quest = all_quests[team.current_quest_index]
    progress = db.query(TeamProgress).filter_by(team_id=team.id, quest_id=quest.id).first()

    return QuestPublic(
        id=quest.id,
        order_index=quest.order_index,
        slug=quest.slug,
        title=quest.title,
        location_name=quest.location_name,
        description=quest.description,
        narrative=quest.narrative,
        challenge_type=quest.challenge_type,
        code_language=quest.code_language,
        code_content=quest.code_content,
        image_url=quest.image_url,
        hint_available=progress.hint_used if progress else False,
        hint_text=quest.hint_text if (progress and progress.hint_used) else None,
        fragment_char=quest.fragment_char if (progress and progress.status == "COMPLETED") else None
    )

@router.get("/fragments")
def get_collected_fragments(team: Team = Depends(get_current_team), db: Session = Depends(get_db)):
    all_quests = db.query(Quest).order_by(Quest.order_index).all()
    fragments = []
    for idx, q in enumerate(all_quests):
        if idx < team.current_quest_index or team.status == "COMPLETED":
            if q.fragment_char and q.fragment_char != "★":
                fragments.append({"order": q.order_index, "char": q.fragment_char, "location": q.location_name})
    return {"fragments": fragments}

@router.post("/submit", response_model=AnswerResult)
async def submit_answer(
    submission: AnswerSubmission,
    team: Team = Depends(get_current_team),
    db: Session = Depends(get_db)
):
    config = db.query(EventConfiguration).first()
    if config and config.event_status == "PAUSED":
        raise HTTPException(status_code=403, detail="THE HUNT HAS BEEN PAUSED BY THE GAME MASTER.")

    if team.status == "RECOVERY":
        remaining = int(team.lockout_until - time.time())
        if remaining > 0:
            raise HTTPException(status_code=429, detail=f"Your expedition is in RECOVERY MODE. Lockout ends in {remaining} seconds.")
        else:
            team.status = "ACTIVE"
            team.lives = 1

    if team.status == "DISQUALIFIED":
        raise HTTPException(status_code=403, detail="Team has been disqualified by Game Master.")

    all_quests = db.query(Quest).order_by(Quest.order_index).all()
    if team.current_quest_index >= len(all_quests):
        return AnswerResult(
            is_correct=True,
            message="Hunt already completed!",
            score_change=0,
            new_score=team.score,
            lives_remaining=team.lives,
            lockout_until=0.0,
            quest_completed=True,
            all_quests_completed=True
        )

    current_quest = all_quests[team.current_quest_index]
    if submission.quest_id != current_quest.id:
        raise HTTPException(status_code=400, detail="Submission target does not match current unlocked quest.")

    # Compute submission hash & normalized checks
    submitted_hash = normalize_and_hash_answer(submission.submitted_value)
    is_primary_correct = (submitted_hash == current_quest.expected_answer_hash)

    # Smart check for ST-18 BREAK THE SEAL (slug: threshold-null)
    if not is_primary_correct and current_quest.slug == "threshold-null":
        cleaned_sub = submission.submitted_value.strip().lower().replace(" ", "").replace("-", "").replace("_", "")
        if cleaned_sub == "cyberdetective":
            is_primary_correct = True

    # Smart check for ST-17 PROMISE EVENT LOOP ORDER (slug: async-void)
    if not is_primary_correct and current_quest.slug == "async-void":
        cleaned_sub = submission.submitted_value.strip().upper().replace(" ", "")
        if cleaned_sub in ["PATHA", "A", "132", "PATHA(132)", "1,3,2", "132OUTPUT"]:
            is_primary_correct = True

    # Smart check for ST-09 UI/UX alignment bug
    if not is_primary_correct and current_quest.slug == "ui-ux-wireframe":
        cleaned_sub = submission.submitted_value.strip().upper().replace(" ", "")
        if cleaned_sub in ["150%", "150", "WIDTH:150%", "WIDTH:150"]:
            is_primary_correct = True

    # Smart check for DEBUG_FIX code editor/interactive debugger submissions
    if not is_primary_correct and current_quest.challenge_type == "DEBUG_FIX":
        cleaned_sub = submission.submitted_value.strip().upper().replace(" ", "").replace("\r", "").replace("\n", "")
        if "==" in cleaned_sub or "IF(SECRET==20)" in cleaned_sub or "SECRET==20" in cleaned_sub:
            is_primary_correct = True

    # For MULTI_KEY challenge (Quest 6)
    is_secondary_correct = True
    if current_quest.challenge_type == "MULTI_KEY":
        if not submission.secondary_value:
            is_secondary_correct = False
        else:
            sec_hash = normalize_and_hash_answer(submission.secondary_value)
            is_secondary_correct = (sec_hash == current_quest.secondary_answer_hash)

    is_correct = is_primary_correct and is_secondary_correct

    attempt = AnswerAttempt(
        team_id=team.id,
        quest_id=current_quest.id,
        submitted_value=submission.submitted_value + (f" | {submission.secondary_value}" if submission.secondary_value else ""),
        is_correct=is_correct,
        timestamp=time.time()
    )
    db.add(attempt)

    progress = db.query(TeamProgress).filter_by(team_id=team.id, quest_id=current_quest.id).first()
    if progress:
        progress.attempt_count += 1

    if is_correct:
        if progress:
            progress.status = "COMPLETED"
            progress.completed_at = time.time()

        score_change = current_quest.completion_points
        team.score += score_change

        db.add(ScoreEvent(
            team_id=team.id,
            event_type="LEVEL_COMPLETE",
            points_changed=score_change,
            reason=f"Completed {current_quest.title}",
            timestamp=time.time()
        ))

        team.current_quest_index += 1
        # All precursor quests finished - unlocks Boss Arena (defeat-boss endpoint handles final completion)
        all_completed = False

        db.commit()

        await manager.broadcast({"type": "LEADERBOARD_UPDATE", "team_id": team.id})

        return AnswerResult(
            is_correct=True,
            message="TERMINAL ACCEPTED. Sequence discovered!",
            score_change=score_change,
            new_score=team.score,
            lives_remaining=team.lives,
            lockout_until=0.0,
            fragment_unlocked=current_quest.fragment_char,
            quest_completed=True,
            all_quests_completed=all_completed
        )
    else:
        penalty = config.wrong_penalty if config else 50
        team.score = max(0, team.score - penalty)
        team.lives -= 1

        db.add(ScoreEvent(
            team_id=team.id,
            event_type="WRONG_ATTEMPT",
            points_changed=-penalty,
            reason=f"Incorrect attempt on {current_quest.title}",
            timestamp=time.time()
        ))

        lockout = 0.0
        if team.lives <= 0:
            team.status = "RECOVERY"
            lockout_duration = config.lockout_seconds if config else 15
            team.lockout_until = time.time() + lockout_duration
            lockout = team.lockout_until

        db.commit()

        await manager.broadcast({"type": "LEADERBOARD_UPDATE", "team_id": team.id})

        return AnswerResult(
            is_correct=False,
            message="TERMINAL REJECTED THE SEQUENCE.",
            score_change=-penalty,
            new_score=team.score,
            lives_remaining=max(0, team.lives),
            lockout_until=lockout,
            quest_completed=False,
            all_quests_completed=False
        )

@router.post("/use-hint")
async def use_hint(team: Team = Depends(get_current_team), db: Session = Depends(get_db)):
    config = db.query(EventConfiguration).first()
    cost = config.hint_cost if config else 200

    all_quests = db.query(Quest).order_by(Quest.order_index).all()
    if team.current_quest_index >= len(all_quests):
        raise HTTPException(status_code=400, detail="All quests completed.")

    quest = all_quests[team.current_quest_index]
    progress = db.query(TeamProgress).filter_by(team_id=team.id, quest_id=quest.id).first()

    # If hint was already unlocked for this quest, return it without deducting points or hint count
    if progress and progress.hint_used:
        return {"hint_text": quest.hint_text, "already_used": True, "hints_remaining": team.hints_remaining, "new_score": team.score}

    if team.hints_remaining <= 0:
        raise HTTPException(status_code=400, detail="No hints remaining for your team.")

    if team.score < cost:
        raise HTTPException(status_code=400, detail=f"Insufficient points. Hints cost {cost} points.")

    team.hints_remaining -= 1
    team.score = max(0, team.score - cost)
    if progress:
        progress.hint_used = True

    db.add(ScoreEvent(
        team_id=team.id,
        event_type="HINT_USED",
        points_changed=-cost,
        reason=f"Used hint for {quest.title}",
        timestamp=time.time()
    ))
    db.commit()

    await manager.broadcast({"type": "LEADERBOARD_UPDATE", "team_id": team.id})

    return {"hint_text": quest.hint_text, "hints_remaining": team.hints_remaining, "new_score": team.score}

@router.post("/defeat-boss")
async def defeat_boss(team: Team = Depends(get_current_team), db: Session = Depends(get_db)):
    config = db.query(EventConfiguration).first()

    if team.status != "COMPLETED":
        team.status = "COMPLETED"
        if not team.completed_at:
            team.completed_at = time.time()

        bonus = config.final_bonus if config else 1000
        team.score += bonus

        db.add(ScoreEvent(
            team_id=team.id,
            event_type="FINAL_BOSS_DEFEATED",
            points_changed=bonus,
            reason="Defeated Master Boss NuLL!",
            timestamp=time.time()
        ))
        db.commit()
        await manager.broadcast({"type": "LEADERBOARD_UPDATE", "team_id": team.id})

    return {
        "status": "COMPLETED",
        "message": "MASTER BOSS NULL DEFEATED! VICTORY ACHIEVED!",
        "score": team.score,
        "completed_at": team.completed_at
    }

@router.post("/claim-treasure/{token_str}")
def claim_physical_treasure(token_str: str, team: Team = Depends(get_current_team), db: Session = Depends(get_db)):
    token = db.query(PhysicalToken).filter_by(token=token_str).first()
    if not token or not token.is_claimed:
        if token:
            token.is_claimed = True
            token.claimed_by_team_id = team.id
            token.claimed_at = time.time()
            db.commit()
            return {"status": "SUCCESS", "message": "Physical Treasure Claimed!"}
    raise HTTPException(status_code=400, detail="Invalid or already claimed physical treasure token.")
