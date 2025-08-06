# ⚡️ Real-Time P2P Chat Application

![Tech Stack](https://img.shields.io/badge/tech-Next.js%20%7C%20WebRTC%20%7C%20Socket.IO-blue)

A high-performance, real-time messaging application that enables private, peer-to-peer (P2P) communication directly between browsers. This project uses WebRTC for secure data channels and a WebSocket-based signaling server to orchestrate connections.

---

## Key Features

- **Real-Time Messaging:** Instantaneous, bi-directional communication using WebRTC's `RTCDataChannel`.
- **Private Chat Rooms:** Users can create or join unique rooms for private, one-on-one conversations.
- **Peer-to-Peer Connection:** After the initial handshake, all messages are sent directly between users, ensuring low latency and enhanced privacy.
- **Efficient Signaling:** A lightweight WebSocket (Socket.IO) server handles the signaling process required to establish the WebRTC connection.
- **Modern & Responsive UI:** Built with **shadcn/ui** and **Tailwind CSS** for a clean and responsive user experience.
- **User Presence:** Real-time notifications for users joining or leaving a room.

---

## Tech Stack

- **Framework:** **Next.js 15** (App Router)
- **Language:** **TypeScript**
- **Frontend:** **React**
- **Styling:** **Tailwind CSS**
- **UI Components:** **shadcn/ui**
- **Signaling Server:** **Socket.IO**
- **P2P Communication:** **WebRTC** (`RTCPeerConnection`, `RTCDataChannel`)

---

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/ParsaSedighi/webrtc-chat-app.git](https://github.com/your-username/your-repo-name.git)
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd webrtc-chat-app
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4. **Add TURN server credentials to .env file:**

    ```
    NEXT_PUBLIC_TURN_USERNAME=your-turn-username
    NEXT_PUBLIC_TURN_CREDENTIAL=your-turn-credentail
    ```

6.  **Run the development server:**

    ```bash
    npm run dev
    ```

7.  **Test the application:**
    Open [http://localhost:3000](http://localhost:3000) in two separate browser tabs or windows. Enter the same Room ID in both tabs to connect and start chatting.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
