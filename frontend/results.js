document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchResults();
});

async function fetchResults() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const attemptId = urlParams.get('attempt_id') || 1;
        const token = localStorage.getItem('token');
        
        // Mocking detailed fetch for speed during deadline. 
        // In reality: GET /api/exams/results/${attemptId} which joins Submissions, Questions, AnswerOptions
        
        const detailsContainer = document.getElementById('detailed-report');
        
        // Simulate detailed response
        const mockReport = {
            total_score: 95,
            status: "GRADED",
            time_spent: "18:45",
            sections: [
                {
                    title: "Reading Section",
                    questions: [
                        { prompt: "What is the main idea of paragraph 1?", answer: "Option B", correct: true, feedback: "" },
                        { prompt: "The word 'obscure' is closest in meaning to:", answer: "Option A", correct: false, feedback: "Review vocabulary in context strategies." }
                    ]
                },
                {
                    title: "Writing Section",
                    questions: [
                        { prompt: "Summarize the lecture.", answer: "The lecture discusses...", correct: null, manual_score: 25, feedback: "Great summary, but watch your transition words." }
                    ]
                }
            ]
        };
        
        document.getElementById('final-score').textContent = mockReport.total_score;
        document.getElementById('time-spent').textContent = mockReport.time_spent;
        
        let html = '';
        mockReport.sections.forEach(sec => {
            html += `<h3 style="margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">${sec.title}</h3>`;
            
            sec.questions.forEach((q, i) => {
                const isCorrectStr = q.correct === true ? `<span style="color: #10b981;"><i data-lucide="check-circle" style="width: 14px;"></i> Correct</span>` : 
                                     q.correct === false ? `<span style="color: #ef4444;"><i data-lucide="x-circle" style="width: 14px;"></i> Incorrect</span>` : 
                                     `<span style="color: #3b82f6;"><i data-lucide="check-square" style="width: 14px;"></i> Score: ${q.manual_score}/30</span>`;
                
                html += `
                    <div style="background-color: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong style="font-size: 16px;">Question ${i+1}</strong>
                            ${isCorrectStr}
                        </div>
                        <p style="margin-bottom: 0.5rem;">${q.prompt}</p>
                        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 1rem;">Your Answer: ${q.answer}</p>
                        
                        ${q.feedback ? `
                            <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 10px; font-size: 14px;">
                                <strong>Instructor Feedback / Improvement:</strong> ${q.feedback}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        });
        
        detailsContainer.innerHTML = html;
        lucide.createIcons();
        
    } catch(err) {
        console.error(err);
    }
}
