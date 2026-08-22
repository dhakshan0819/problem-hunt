from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Team, Admin, EventConfiguration, Quest, TeamProgress
from app.schemas import TeamRegister, TeamResponse, AdminLogin, Token
from app.security import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TeamResponse)
def register_team(team_in: TeamRegister, db: Session = Depends(get_db)):
    config = db.query(EventConfiguration).first()

    # Check if STUDENT NAME or code exists
    existing = db.query(Team).filter(
        (Team.name == team_in.name) | (Team.registration_code == team_in.registration_code)
    ).first()

    if existing:
        # If code matches existing team, treat as login
        if existing.registration_code == team_in.registration_code:
            return existing
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="STUDENT NAME or registration code already taken."
        )

    # Create new team
    new_team = Team(
        name=team_in.name,
        registration_code=team_in.registration_code,
        score=config.starting_score if config else 1000,
        lives=config.starting_lives if config else 3,
        hints_remaining=config.hints_per_team if config else 2,
        current_quest_index=0,
        status="ACTIVE"
    )
    db.add(new_team)
    db.flush()

    # Initialize progress for all active quests
    all_quests = db.query(Quest).order_by(Quest.order_index).all()
    for idx, q in enumerate(all_quests):
        prog_status = "UNLOCKED" if idx == 0 else "LOCKED"
        prog = TeamProgress(
            team_id=new_team.id,
            quest_id=q.id,
            status=prog_status
        )
        db.add(prog)

    db.commit()
    db.refresh(new_team)
    return new_team

@router.post("/login", response_model=TeamResponse)
def login_team(registration_code: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter_by(registration_code=registration_code).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found with the provided registration code."
        )
    return team

@router.post("/admin/login", response_model=Token)
def admin_login(admin_in: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter_by(username=admin_in.username).first()
    if not admin or not verify_password(admin_in.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )

    access_token = create_access_token(data={"sub": admin.username, "role": "admin"})
    return Token(access_token=access_token)
