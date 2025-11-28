import { useState, useRef, useEffect } from 'react';
import './SearchableCategoryDropdown.css';

function SearchableCategoryDropdown({ 
    categories, 
    selectedCategoryId, 
    onChange, 
    onCreateCategory, 
    isCreating,
    error 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Get enabled categories
    const enabledCategories = categories.filter(cat => cat.enabled);

    // Filter categories based on search text
    const filteredCategories = enabledCategories.filter(cat =>
        cat.categoryName.toLowerCase().includes(searchText.toLowerCase())
    );

    // Check if search text matches any existing category exactly
    const exactMatch = enabledCategories.some(
        cat => cat.categoryName.toLowerCase() === searchText.toLowerCase()
    );

    // Get selected category name
    const selectedCategory = enabledCategories.find(
        cat => String(cat.categoryId) === String(selectedCategoryId)
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchText('');
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        const showCreateOption = searchText.trim() && !exactMatch;
        const totalOptions = filteredCategories.length + (showCreateOption ? 1 : 0);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setHighlightedIndex(prev => 
                        prev < totalOptions - 1 ? prev + 1 : prev
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    if (highlightedIndex < filteredCategories.length) {
                        handleSelect(filteredCategories[highlightedIndex]);
                    } else if (showCreateOption) {
                        handleCreate();
                    }
                } else if (showCreateOption && filteredCategories.length === 0) {
                    handleCreate();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchText('');
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
            default:
                break;
        }
    };

    const handleSelect = (category) => {
        onChange(String(category.categoryId));
        setIsOpen(false);
        setSearchText('');
        setHighlightedIndex(-1);
    };

    const handleCreate = () => {
        if (searchText.trim() && !isCreating) {
            onCreateCategory(searchText.trim());
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleInputChange = (e) => {
        setSearchText(e.target.value);
        setHighlightedIndex(-1);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    // Highlight matching text in search results
    const highlightMatch = (text) => {
        if (!searchText.trim()) return text;
        
        const regex = new RegExp(`(${searchText.trim()})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            part.toLowerCase() === searchText.toLowerCase() 
                ? <mark key={index}>{part}</mark> 
                : part
        );
    };

    const showCreateOption = searchText.trim() && !exactMatch;

    return (
        <div className="searchable-dropdown" ref={dropdownRef}>
            <div className="dropdown-input-wrapper">
                <svg 
                    className="search-icon" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="dropdown-input"
                    placeholder={selectedCategory ? selectedCategory.categoryName : "Search or create..."}
                    value={searchText}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                />
                {selectedCategory && !isOpen && (
                    <span className="selected-badge">{selectedCategory.categoryName}</span>
                )}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    {filteredCategories.length > 0 && (
                        <div className="dropdown-section">
                            {filteredCategories.map((cat, index) => (
                                <div
                                    key={cat.categoryId}
                                    className={`dropdown-item ${
                                        String(cat.categoryId) === String(selectedCategoryId) ? 'selected' : ''
                                    } ${highlightedIndex === index ? 'highlighted' : ''}`}
                                    onClick={() => handleSelect(cat)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    {highlightMatch(cat.categoryName)}
                                    {String(cat.categoryId) === String(selectedCategoryId) && (
                                        <svg 
                                            className="check-icon"
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {showCreateOption && (
                        <>
                            {filteredCategories.length > 0 && <div className="dropdown-divider"></div>}
                            <div
                                className={`dropdown-item create-option ${
                                    highlightedIndex === filteredCategories.length ? 'highlighted' : ''
                                } ${isCreating ? 'loading' : ''}`}
                                onClick={handleCreate}
                                onMouseEnter={() => setHighlightedIndex(filteredCategories.length)}
                            >
                                {isCreating ? (
                                    <span className="creating-text">Creating...</span>
                                ) : (
                                    <>
                                        <svg 
                                            className="plus-icon"
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="16" 
                                            height="16" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        >
                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        Create "<span className="create-text">{searchText.trim()}</span>"
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {filteredCategories.length === 0 && !showCreateOption && (
                        <div className="dropdown-empty">
                            {enabledCategories.length === 0 
                                ? "Type to create a category" 
                                : "No matching categories"
                            }
                        </div>
                    )}
                </div>
            )}

            {error && <small className="dropdown-error">{error}</small>}
        </div>
    );
}

export default SearchableCategoryDropdown;
