import uvicorn
import socket

if __name__ == "__main__":
    host_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        host_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass

    print("=================================================================")
    print(" CODE HUNT EXPEDITION SERVER STARTING ")
    print(f" Local Host Access: http://localhost:8000")
    print(f" LAN WiFi Access:   http://{host_ip}:8000")
    print(f" API Documentation: http://{host_ip}:8000/docs")
    print("=================================================================")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
