import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchableCategoryDropdown from './SearchableCategoryDropdown';

function TransactionForm({ categories, onSubmit, isDeleting, isSaving, transaction, onDelete, onCreateCategory, isCreatingCategory }) {
    // form field controll
    const { register, handleSubmit, watch, reset, formState, setValue, clearErrors } = useForm();
    const date = useRef({});
    date.current = watch('date');
    const navigate = useNavigate();
    
    // Track selected category for the searchable dropdown
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    useEffect(() => {
        if (transaction && transaction.transactionId) {
            reset({
                category: String(transaction.categoryId),
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date.split('T')[0]
            });
            setSelectedCategoryId(String(transaction.categoryId));
        }
    }, [reset, transaction])

    // Register the category field for validation
    useEffect(() => {
        register('category', { required: "Category is required" });
    }, [register]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setValue('category', categoryId);
        clearErrors('category');
    };

    const deleteTransaction = (e, id) => {
        e.preventDefault()
        onDelete(id)
    }

    const cancelProcess = (e) => {
        e.preventDefault()
        navigate('/user/transactions')
    }


    return (
        <form className="auth-form t-form" onSubmit={handleSubmit(onSubmit)}>

            <div className='input-box'>

                {/* input category */}
                <label>Transaction Category</label><br />
                <SearchableCategoryDropdown
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onChange={handleCategoryChange}
                    onCreateCategory={onCreateCategory}
                    isCreating={isCreatingCategory}
                    error={formState.errors.category?.message}
                />
            </div>

            {/* input description */}
            <div className='input-box'>
                <label>Transaction description</label><br />
                <input
                    type='text'
                    {...register('description', {
                        maxLength: {
                            value: 50,
                            message: "Description can have atmost 50 characters!"
                        }
                    })}
                />
                {formState.errors.description && <small>{formState.errors.description.message}</small>}
            </div>

            {/* input amount */}
            <div className='input-box'>
                <label>Amount</label><br />
                <input
                    type='text'
                    {...register('amount', {
                        required: "Amount is required!",
                        pattern: { value: /^[0-9.]{1,}$/g, message: "Invalid amount!" }
                    })}
                />
                {formState.errors.amount && <small>{formState.errors.amount.message}</small>}
            </div>

            {/* input date */}
            <div className='input-box'>
                <label>Date</label><br />
                <input
                    type='date'
                    value={(date.current === undefined) ? new Date().toISOString().split('T')[0] : date.current}
                    {...register('date')}
                />
                {formState.errors.date && <small>{formState.errors.date.message}</small>}
            </div>

            <div className='t-btn input-box'>
                <input type='submit' value={isSaving ? "Saving..." : 'Save transaction'}
                    className={isSaving ? "button button-fill loading" : "button button-fill"} />
                <input type='submit' className='button outline' value='Cancel' onClick={(e) => cancelProcess(e)} />

            </div>
            {
                transaction ?
                    <div className='t-btn input-box'>
                        <button
                            className={isDeleting ? "button delete loading" : "button delete"}
                            onClick={(e) => deleteTransaction(e, transaction.transactionId)} 
                        >
                            {isDeleting ? "Deleting..." : 'Delete transaction'} 
                        </button>
                    </div>
                    : <></>
            }
        </form>
    )
}

export default TransactionForm;