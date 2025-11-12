import { Modal } from 'antd';
import React, { useEffect, useState } from 'react'
import { ImArrowLeft2 } from 'react-icons/im';
import ContactInfo from './ContactInfo';
import BasicForm from './BasicForm';
import { ConditionalRendering } from '../../utils/Methods';
import './Index.css'

const UserPersonalDetailsForm = ({ isOpen, setIsOpen, loading }) => {

    const [selected, setSelected] = useState({});
    const [inDisplay, setInDisplay] = useState([1]);

    useEffect(() => {
        if (!isOpen) {
            setInDisplay([1]);
            setSelected({});
        }
    }, [isOpen]);

    const isInDisplay = (page) => inDisplay[inDisplay.length - 1] === page;

    const activeDispaly = inDisplay.slice(-1)[0];
    console.log(activeDispaly)

    const goBack = () => {
        if (!loading) {
            setInDisplay([1]);
        }
    }

    const onCancel = () => {
        if (!loading) {
            setIsOpen(false);
        }
    };

    const onSelect = (item, page) => {
        switch (page) {
            case 1:
                setSelected({ ...selected });
                setInDisplay([1]);
                break;
            case 2:
                if (item) {
                    setSelected({ ...selected, values: item });
                    setInDisplay([2]);
                }
            default:
                break;
        };
    }

    const renderGoBack = () => {
        if ([2, 3].includes(activeDispaly)) {
            return <ImArrowLeft2 className="" onClick={goBack} />
        }
        return null;
    }

    const renderTitle = () => {
        let title = '';
        switch (activeDispaly) {
            case 1:
                title = 'Add Basic Details'
                break;
            case 2:
                title = 'Add Contact Info'
                break;
            default:
                break;
        }
        return <span className="arrow-title" >{renderGoBack()}{title}</span>
    }


    return (
        <div className="user-details-form-main">
            <Modal
                title={renderTitle()}
                width={500}
                centered
                open={isOpen}
                maskClosable={false}
                closable={!loading}
                onCancel={false}
               footer={null}
                destroyOnClose
            >

                <ConditionalRendering
                    condition={isInDisplay(1)}
                    children={<BasicForm
                        onSelect={onSelect}
                        isOpen={isOpen}
                        data={selected}
                        onCancel={() => onCancel()}
                    />}
                />

                <ConditionalRendering
                    condition={isInDisplay(2)}
                    children={<ContactInfo
                        onSelect={onSelect}
                        data={selected}
                        isOpen={isOpen}
                        onCancel={onCancel}
                        setIsOpen={setIsOpen}
                    />}
                />
            </Modal>
        </div>
    )
}

export default UserPersonalDetailsForm
