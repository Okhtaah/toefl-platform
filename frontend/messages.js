// messages.js - Student Messaging
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'auth.html';
        return;
    }
    lucide.createIcons();
    loadMessages();
});

async function loadMessages() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/messages', {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) return; // Graceful fallback if route not set up yet

        const messages = await res.json();
        const container = document.getElementById('chat-messages');

        if (messages.length > 0) {
            // Build user_id from token to distinguish sent vs received
            const payload = JSON.parse(atob(token.split('.')[1]));
            const myId = payload.user?.id;

            const msgsHtml = messages.map(m => {
                const isSent = m.sender_id === myId;
                const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="msg-bubble ${isSent ? 'sent' : 'received'} shadow-sm">
                        ${m.content}
                        <div class="msg-meta">${time}</div>
                    </div>
                `;
            }).join('');

            container.innerHTML = `<div class="date-divider">Conversation History</div>` + msgsHtml;
        }

        // Scroll to bottom
        const container2 = document.getElementById('chat-messages');
        container2.scrollTop = container2.scrollHeight;

    } catch (err) {
        console.error('Failed to load messages:', err);
    }
}

async function sendMsg() {
    const input = document.getElementById('msg-input');
    const content = input.value.trim();
    if (!content) return;

    const token = localStorage.getItem('token');
    const container = document.getElementById('chat-messages');

    // Optimistically render the message
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble sent shadow-sm animate-in';
    bubble.innerHTML = `${content}<div class="msg-meta">${now}</div>`;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    input.value = '';

    // Send to backend
    try {
        await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ content })
        });
    } catch (err) {
        console.error('Failed to send message:', err);
    }
}
