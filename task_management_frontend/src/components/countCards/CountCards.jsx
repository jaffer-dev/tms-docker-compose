import React from 'react';
import './CountCards.css';
import { formatCountsArray, readableText } from '../../utils/Methods';
import { Spin } from 'antd';

const CountCards = ({ stats = [], type, loading = false, onCardClick }) => {

    const getCardClass = (status) => {
        return status === 'annual' || status === 'TOTAL'
            ? 'count-card-blue'
            : `count-card-${status.replace(/_/g, '-')}`;
    };

    return (
        <div className='count-main'>
            <div className="count-cards">
                {formatCountsArray(stats, type)?.map((item, index) => (
                    <div
                        className={`count-card-body ${getCardClass(item.status)}`}
                        key={index}
                        onClick={() => {
                            if (item.count > 0) {
                                if (onCardClick) {
                                    onCardClick(item);
                                }
                            }
                        }}
                    >
                        {loading ? (
                            <div className="card-loading">
                                <Spin tip="Loading..." size="medium" />
                            </div>
                        ) : (
                            <>
                                <div className="count-title">
                                    <h4>{readableText(item?.status)}</h4>
                                </div>
                                <div className="count-stats">
                                    <h3>{item.count}</h3>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountCards;
