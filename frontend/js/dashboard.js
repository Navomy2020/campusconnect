const API_URL = 'http://localhost:5000';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
    window.location.href = 'login.html';
}

// Update Profile Button
const profileBtn = document.getElementById('profileBtn');
if (user) {
    profileBtn.textContent = `${user.name} (${user.points} pts)`;
    // Fetch updated points
    fetch(`${API_URL}/leaderboard`)
        .then(res => res.json())
        .then(users => {
            const currentUser = users.find(u => u.id === user.id);
            if (currentUser) {
                profileBtn.textContent = `${currentUser.name} (${currentUser.points} pts)`;
                // Optionally update localStorage
                user.points = currentUser.points;
                localStorage.setItem('user', JSON.stringify(user));
            }
        })
        .catch(err => console.error('Error fetching points:', err));
}

// Fetch Questions
async function loadQuestions() {
    try {
        const response = await fetch(`${API_URL}/questions`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const questions = await response.json();

        const list = document.getElementById('questionsList');
        list.innerHTML = '';

        // Filter out solved questions as requested: "Once a queation is solved it should be deleted from the database"
        // Since we are simulating deletion by hiding, we filter here.
        const activeQuestions = questions.filter(q => !q.is_solved);

        if (activeQuestions.length === 0) {
            list.innerHTML = '<p>No active questions found.</p>';
            return;
        }

        activeQuestions.forEach(q => {
            const card = document.createElement('a');
            card.className = 'question-card';
            card.href = `answer.html?id=${q.id}`;

            card.innerHTML = `
                <div class="question-header">
                    <span class="question-title">${q.title}</span>
                </div>
                <div class="question-meta">
                    <span class="tag">${q.category || 'General'}</span>
                    <span>Asked by ${q.name}</span>
                </div>
                <p style="margin-top: 10px; color: #636e72;">${q.description.substring(0, 100)}${q.description.length > 100 ? '...' : ''}</p>
            `;
            list.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Post Question Logic
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('postModal');
    const btn = document.getElementById('postQuestionBtn');
    const span = document.getElementsByClassName('close-btn')[0];

    if (btn) {
        btn.onclick = () => {
            modal.style.display = "flex";
        }
    }

    if (span) {
        span.onclick = () => {
            modal.style.display = "none";
        }
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const postQuestionForm = document.getElementById('postQuestionForm');
    if (postQuestionForm) {
        postQuestionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('q-title').value;
            const domain = document.getElementById('q-domain').value;
            const description = document.getElementById('q-description').value;

            console.log('Submitting question:', { title, domain, description });

            try {
                const response = await fetch(`${API_URL}/questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, domain })
                });

                if (response.ok) {
                    alert('Question posted!');
                    modal.style.display = "none";
                    loadQuestions(); // Reload list
                    // Reset form
                    postQuestionForm.reset();
                } else {
                    const data = await response.json();
                    alert(data.message || 'Error posting question');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to connect to server');
            }
        });
    }
});

// Initial load
loadQuestions();
