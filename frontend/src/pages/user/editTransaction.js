import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import UserService from '../../services/userService';
import TransactionForm from '../../components/userTransactions/transactionForm';
import TransactionTypeSelectWrapper from '../../components/userTransactions/transactionTypeSelectWrapper';
import Header from '../../components/utils/header';
import Loading from '../../components/utils/loading';
import Container from '../../components/utils/Container';
import toast, { Toaster } from 'react-hot-toast';

const transactionTypes = [{ 'id': 1, 'name': 'Expense' }, { 'id': 2, 'name': 'Income' }]

function EditTransaction() {

    const { transactionId } = useParams();
    const [transaction, setData] = useState({});
    const [categories, setCategories] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [activeTransactionType, setTransactionType] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const navigate = useNavigate();

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        await UserService.get_categories().then(
            (response) => {
                if (response.data.status === "SUCCESS") {
                    setCategories(response.data.response);
                }
            },
            (error) => {
                error.response ?
                    toast.error(error.response.data.response)
                    :
                    toast.error("Failed to fetch categories: Try again later!");
            }
        ).finally(() => {
            setIsFetching(false);
        });
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        setFilteredCategories(categories.filter(cat => cat.transactionType.transactionTypeId === activeTransactionType));
    }, [categories, activeTransactionType])


    // to be edited transaction fetch
    const getTransaction = useCallback(async () => {
        await UserService.get_single_transaction(transactionId).then(
            (response) => {
                if (response.data.status === "SUCCESS") {
                    setData(response.data.response)
                }
            },
            (error) => {
                error.response ?
                    toast.error(error.response.data.response)
                    :
                    toast.error("Failed to fetch transaction information: Try again later!")
            }
        )

    }, [transactionId]);

    useEffect(() => {
        getTransaction()
    }, [getTransaction])

    useEffect(() => {
        setTransactionType(transaction.transactionType)
    }, [transaction])

    // form submition controll
    const onSubmit = async (data) => {
        setIsSaving(true)
        await UserService.update_transaction(
            transactionId, AuthService.getCurrentUser().email, data.category, data.description, data.amount, data.date
        ).then(
            (response) => {
                if (response.data.status === "SUCCESS") {
                    navigate("/user/transactions", { state: { text: response.data.response } })
                    return
                }
            },
            (error) => {
                error.response ?
                    toast.error(error.response.data.response)
                    :
                    toast.error("Failed to edit transaction information: Try again later!")
            }
        );
        setIsSaving(false);
    }

    const onDelete = async (id) => {
        setIsDeleting(true)
        await UserService.delete_transaction(id).then(
            (response) => {
                if (response.data.status === "SUCCESS") {
                    navigate("/user/transactions", { state: { text: response.data.response } })
                }
            },
            (error) => {
                error.response ?
                    toast.error(error.response.data.response)
                    :
                    toast.error("Failed to delete transaction: Try again later!")
            }
        )
        setIsDeleting(false)
    }

    const onCreateCategory = async (categoryName) => {
        setIsCreatingCategory(true);
        await UserService.create_category(categoryName, activeTransactionType).then(
            async (response) => {
                if (response.data.status === "SUCCESS") {
                    toast.success("Category created successfully!");
                    // Refetch categories to get the new category with its ID
                    await UserService.get_categories().then(
                        (catResponse) => {
                            if (catResponse.data.status === "SUCCESS") {
                                setCategories(catResponse.data.response);
                            }
                        }
                    );
                }
            },
            (error) => {
                error.response ?
                    toast.error(error.response.data.response)
                    :
                    toast.error("Failed to create category: Try again later!");
            }
        );
        setIsCreatingCategory(false);
    }

    return (
        <Container activeNavId={1}>
            <Header title="Edit Transaction" />
            <Toaster/>
            {isFetching && <Loading />}
            {
                !isFetching && (
                    <>
                        <TransactionTypeSelectWrapper
                            transactionTypes={transactionTypes}
                            setTransactionType={setTransactionType}
                            activeTransactionType={activeTransactionType}
                        />
                        <TransactionForm
                            categories={filteredCategories}
                            onSubmit={onSubmit}
                            isDeleting={isDeleting}
                            isSaving={isSaving}
                            transaction={transaction}
                            onDelete={onDelete}
                            onCreateCategory={onCreateCategory}
                            isCreatingCategory={isCreatingCategory}
                        />
                    </>
                )
            }
        </Container>
    )
}

export default EditTransaction;