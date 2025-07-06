import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddSupplier from '../../components/SupplierComponents/AddSupplierModal';
import Header from '../../components/Header';
import useRequireStore from '../../hooks/useRequireStore';

const AddSupplierPage: React.FC = () => {
    const navigate = useNavigate();
    const currentStore = useRequireStore();

    const handleCloseModal = () => {
        navigate(`/store/${currentStore?.id}/supplier`);
    };

    return (
        <div>
            <Header />
            <AddSupplier 
                isOpen={true} 
                onClose={handleCloseModal}
            />
        </div>
    );
};
export default AddSupplierPage;