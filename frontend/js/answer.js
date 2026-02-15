const API_URL = 'http://localhost:5000';
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user'));

if (!token) {
    window.location.href = 'login.html';
}

const urlParams = new URLSearchParams(window.location.search);
const questionId = urlParams.get('id');

if (!questionId) {
    alert('No question specified');
    window.location.href = 'dashboard.html';
}

async function loadQuestionDetails() {
    try {
        const response = await fetch(`${API_URL}/questions/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert('Question not found');
            window.location.href = 'dashboard.html';
            return;
        }

        const data = await response.json();
        const question = data.question;
        const answers = data.answers;

        // Render Question
        const qContainer = document.getElementById('questionDetail');
        qContainer.innerHTML = `
            <h2>${question.title}</h2>
            <div class="question-meta" style="margin-bottom: 1rem;">
                <span class="tag">${question.category || 'General'}</span>
                <span>Asked by ${question.name}</span>
            </div>
            <p>${question.description}</p>
        `;

        // Render Answers
        const aList = document.getElementById('answersList');
        aList.innerHTML = '';

        if (answers.length === 0) {
            aList.innerHTML = '<p>No answers yet. Be the first to answer!</p>';
        } else {
            answers.forEach(ans => {
                const isAccepted = ans.is_accepted;
                const div = document.createElement('div');
                div.className = `answer-card ${isAccepted ? 'accepted' : ''}`;

                let acceptButtonHtml = '';
                // Show accept button if: 
                // 1. Current user is the question owner
                // 2. Question is NOT solved yet (or this answer is the accepted one)
                // 3. This answer is NOT owned by the current user (optional, but usually you don't accept your own answer)

                // Backend check: questions[0].user_id (owner)
                // We need to know if current user is owner.
                // The API returns 'question' object with 'user_id'.

                const isOwner = currentUser.id === question.user_id;

                if (isOwner && !question.is_solved && !isAccepted) {
                    acceptButtonHtml = `<button onclick="acceptAnswer(${ans.id})" class="accept-btn">Accept Answer</button>`;
                }

                if (isAccepted) {
                    acceptButtonHtml = `<span style="color: var(--success-color); font-weight: bold;">✔ Accepted Answer</span>`;
                }

                div.innerHTML = `
                    <p>${ans.answer_text}</p>
                    <div class="question-meta" style="margin-top: 1rem;">
                        <span>Answered by ${ans.name}</span>
                        <div style="float: right;">
                            ${acceptButtonHtml}
                        </div>
                    </div>
                `;
                aList.appendChild(div);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

async function postAnswer(e) {
    e.preventDefault();
    const text = document.getElementById('answerText').value;

    try {
        const response = await fetch(`${API_URL}/answers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                question_id: questionId,
                answer_text: text
            })
        });

        if (response.ok) {
            document.getElementById('answerText').value = '';
            loadQuestionDetails(); // Reload to show new answer
        } else {
            const data = await response.json();
            alert(data.message || 'Error posting answer');
        }
    } catch (error) {
        console.error(error);
    }
}

async function acceptAnswer(answerId) {
    if (!confirm('Are you sure you want to accept this answer? This will mark the question as solved.')) return;

    try {
        const response = await fetch(`${API_URL}/answers/${answerId}/accept`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Answer accepted!');
            loadQuestionDetails();
        } else {
            const data = await response.json();
            alert(data.message || 'Error accepting answer');
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('postAnswerForm').addEventListener('submit', postAnswer);

loadQuestionDetails();
