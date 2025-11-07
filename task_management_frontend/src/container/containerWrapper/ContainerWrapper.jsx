import React, { useEffect, useState } from 'react'
import { PageHeader } from '../../components'
import './ContainerWrapper.css'

function ContainerWrapper({ children, pageHeaderProps }) {

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 0);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="container-wrapper-main">
            <div
                className={`container-wrapper-header ${scrolled ? 'scrolled' : ''}`}
            >
                <PageHeader {...pageHeaderProps} />
            </div>

            <div className="container-wrapper-body">
                {children}
            </div>
        </div>
    )
}

export default ContainerWrapper