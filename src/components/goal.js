import React from 'react';

import Progress from './progress';

const Goal = ({ totalWords, todayWords, endDate, goal }) => {
    const diffTime = Math.abs(new Date() - endDate);
    const daysBeforeEnd = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyGoal = Math.round(goal / daysBeforeEnd);
    const dailyPercentage = Math.min(Math.round((todayWords / dailyGoal) * 100), 100);
    const totalPercentage = Math.min(Math.round((totalWords / goal) * 100), 100);

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div>
                <p style={{ margin: 0 }}><b>Book total goal</b></p>
                <p style={{ marginTop: 0, fontSize: 12 }}>{`${totalPercentage}% completed (${totalWords} / ${goal} words)`}</p>
                <Progress percentage={totalPercentage} />
            </div>

            <div>
                <p style={{ margin: 0 }}><b>Book daily goal</b></p>
                <p style={{ marginTop: 0, fontSize: 12 }}>{`${dailyPercentage}% completed (${todayWords} / ${dailyGoal} words)`}</p>
                <Progress percentage={Math.max(dailyPercentage, 0)} />
            </div>
        </div>
    );
};

Goal.defaultProps = {
    todayWords: 0,
    totalWords: 0,
    goal: 0,
    endDate: (new Date()).setDate((new Date()).getDate() + 30),
};

export default Goal;
