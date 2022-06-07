import React from 'react';

const Goal = ({ words, todayWords, endDate, goal }) => {
    const diffTime = Math.abs(new Date() - endDate);
    const daysBeforeEnd = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyGoal = Math.round(goal / daysBeforeEnd);
    const percentage = Math.round((words / goal) * 100);

    return (
        <div>
            <div>
                <p><b>Book daily goal</b></p>
                <p style={{ fontSize: 12 }}>{`${Math.max(todayWords, 0)} / ${dailyGoal} words`}</p>
            </div>

            <div>
                <p><b>Book target words</b></p>
                <p style={{ fontSize: 12 }}>{`${percentage}% completed (${words} / ${goal} words)`}</p>
                <div
                    style={{
                        width: '100%',
                        backgroundColor: '#D1D5DB',
                        marginTop: '0.5rem',
                    }}
                >
                    <div
                        style={{
                            width: `${percentage >= 100 ? 100 : percentage}%`,
                            paddingTop: '0.5rem',
                            paddingBottom: '0.5rem',
                            backgroundColor: '#6B7280',
                            fontSize: '0.75rem',
                            lineHeight: '1rem',
                            fontWeight: 700,
                            textAlign: 'center',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

Goal.defaultProps = {
    todayWords: 0,
    words: 0,
    goal: 0,
    endDate: (new Date()).setDate((new Date()).getDate() + 30),
};

export default Goal;
