import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const NewProjectModal = ({ customers, onSave, onCancel }) => {
    const [projectName, setProjectName] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!projectName.trim()) {
            setError('Work order number is required.');
            return;
        }
        if (!customerName.trim()) {
            setError('Customer name is required.');
            return;
        }
        setError('');
        await onSave({ title: projectName, customer_name: customerName });
    };

    const modalStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px'
        },
        modal: {
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #374151'
        },
        title: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px'
        },
        label: {
            color: '#9ca3af',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            display: 'block'
        },
        input: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#111827',
            color: 'white',
            borderRadius: '6px',
            border: '1px solid #374151',
            marginBottom: '16px',
            fontSize: '14px'
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        },
        button: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        cancelButton: {
            backgroundColor: '#374151',
            color: 'white'
        },
        saveButton: {
            backgroundColor: '#f97316',
            color: 'white'
        },
        errorBox: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            border: '1px solid #ef4444',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px'
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h2 style={modalStyles.title}>Create New Work Order</h2>
                {error && <div style={modalStyles.errorBox}>{error}</div>}
                
                <label style={modalStyles.label}>Work Order Number</label>
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter work order number"
                    style={modalStyles.input}
                />
                
                <label style={modalStyles.label}>Customer Name / Company</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name or company name"
                    style={modalStyles.input}
                />
                
                <div style={modalStyles.buttonContainer}>
                    <button onClick={onCancel} style={{...modalStyles.button, ...modalStyles.cancelButton}}>Cancel</button>
                    <button onClick={handleSave} style={{...modalStyles.button, ...modalStyles.saveButton}}>Save Work Order</button>
                </div>
            </div>
        </div>
    );
};


const EmployeeTimesheet = ({ user, onLogout }) => {
    const [projects, setProjects] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    
    const [selectedProject, setSelectedProject] = useState('');
    const [clockInTime, setClockInTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [notes, setNotes] = useState('');

    const [usedMaterials, setUsedMaterials] = useState([]);
    const [usedConsumables, setUsedConsumables] = useState([]);

    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const materials = inventory.filter(i => i.category !== 'Consumables' && i.category !== 'Gas');
    const consumables = inventory.filter(i => i.category === 'Consumables' || i.category === 'Gas');

    const styles = {
        container: { 
            minHeight: '100vh', 
            backgroundColor: '#111827', 
            color: 'white', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' 
        },
        header: { 
            backgroundColor: '#1f2937', 
            borderBottom: '1px solid #374151', 
            padding: '16px 24px' 
        },
        title: { 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#f97316', 
            margin: 0 
        },
        main: { 
            padding: '24px',
            maxWidth: '800px',
            margin: '0 auto'
        },
        card: { 
            backgroundColor: '#1f2937', 
            borderRadius: '8px', 
            padding: '24px', 
            border: '1px solid #374151',
            marginBottom: '24px'
        },
        sectionTitle: { 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'white', 
            marginBottom: '16px', 
            borderBottom: '1px solid #374151', 
            paddingBottom: '8px' 
        },
        select: { 
            width: '100%', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #374151', 
            backgroundColor: '#111827', 
            color: 'white', 
            fontSize: '16px', 
            marginBottom: '16px' 
        },
        button: { 
            width: '100%', 
            padding: '16px', 
            borderRadius: '8px', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '12px',
            transition: 'background-color 0.2s'
        },
        clockInButton: { 
            backgroundColor: '#059669' 
        },
        clockOutButton: { 
            backgroundColor: '#dc2626' 
        },
        secondaryButton: { 
            backgroundColor: '#374151',
            fontSize: '14px',
            padding: '12px'
        },
        timerDisplay: { 
            fontSize: '48px', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            margin: '24px 0', 
            color: '#60a5fa',
            backgroundColor: '#111827',
            borderRadius: '8px',
            padding: '16px'
        },
        jobInfo: { 
            textAlign: 'center', 
            marginBottom: '24px', 
            fontSize: '16px' 
        },
        textarea: { 
            width: '100%', 
            boxSizing: 'border-box', 
            padding: '12px', 
            borderRadius: '6px', 
            border: '1px solid #374151', 
            backgroundColor: '#111827', 
            color: 'white', 
            fontSize: '16px', 
            minHeight: '100px', 
            resize: 'vertical', 
            marginBottom: '16px' 
        },
        errorBox: { 
            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
            color: '#f87171', 
            border: '1px solid #ef4444', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px', 
            textAlign: 'center' 
        },
        successBox: { 
            backgroundColor: 'rgba(34, 197, 94, 0.2)', 
            color: '#4ade80', 
            border: '1px solid #22c55e', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px', 
            textAlign: 'center' 
        },
        logoutButton: { 
            backgroundColor: '#f97316', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            padding: '8px 16px', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '500' 
        },
        materialRow: { 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '8px',
            alignItems: 'center'
        },
        materialInput: { 
            flex: 1, 
            padding: '10px', 
            borderRadius: '6px', 
            border: '1px solid #374151', 
            backgroundColor: '#111827', 
            color: 'white', 
            fontSize: '14px' 
        },
        quantityInput: { 
            width: '80px', 
            padding: '10px', 
            borderRadius: '6px', 
            border: '1px solid #374151', 
            backgroundColor: '#111827', 
            color: 'white', 
            fontSize: '14px' 
        },
        unitLabel: {
            color: '#9ca3af',
            fontSize: '14px',
            width: '60px',
            textAlign: 'center'
        },
        removeButton: {
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px'
        },
        loadingText: { 
            color: '#9ca3af', 
            textAlign: 'center', 
            fontSize: '18px', 
            paddingTop: '40px' 
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data: projectsData, error: projectsError } = await supabase.from('projects').select('id, title').order('created_at', { ascending: false });
            if (projectsError) throw projectsError;
            // Map title to name for consistency within the component
            const formattedProjects = projectsData.map(p => ({ ...p, name: p.title }));
            setProjects(formattedProjects);

            const { data: inventoryData, error: inventoryError } = await supabase.from('inventory').select('id, name, unit, category').order('name');
            if (inventoryError) throw inventoryError;
            setInventory(inventoryData);
            
            const { data: customersData, error: customersError } = await supabase.from('customers').select('id, name').order('name');
            if (customersError) throw customersError;
            setCustomers(customersData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (clockInTime) {
            const timer = setInterval(() => {
                setElapsedTime(Math.floor((new Date() - clockInTime) / 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [clockInTime]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleClockIn = () => {
        if (!selectedProject) {
            setError('Please select a work order before clocking in.');
            return;
        }
        setError('');
        setSuccess('');
        setClockInTime(new Date());
    };
    
    const resetState = () => {
        setClockInTime(null);
        setElapsedTime(0);
        setNotes('');
        setUsedMaterials([]);
        setUsedConsumables([]);
        setSelectedProject('');
        setError('');
        setSuccess('Timesheet submitted successfully!');
        setTimeout(() => setSuccess(''), 5000);
    };

    const handleClockOut = async () => {
        if (!clockInTime) return;
        
        setLoading(true);
        setError(''); // Clear previous errors

        try {
            // Step 1: Insert the main timesheet entry
            const { data: timesheetEntry, error: entryError } = await supabase
                .from('timesheet_entries')
                .insert({
                    employee_id: user.id,
                    project_id: selectedProject,
                    start_time: clockInTime.toISOString(),
                    end_time: new Date().toISOString(),
                    duration_minutes: (new Date() - clockInTime) / 1000 / 60,
                    notes: notes,
                })
                .select('id')
                .single();

            if (entryError) throw entryError;

            // Step 2: Log materials and update inventory
            const allUsedItems = [...usedMaterials, ...usedConsumables].filter(item => item.quantity > 0);
            
            if (allUsedItems.length > 0) {
                // Log all materials used in this timesheet entry
                const materialsToInsert = allUsedItems.map(item => ({
                    timesheet_entry_id: timesheetEntry.id,
                    inventory_id: item.inventory_id,
                    quantity_used: item.quantity
                }));
                
                const { error: materialsError } = await supabase
                    .from('timesheet_materials_used')
                    .insert(materialsToInsert);
                if (materialsError) throw materialsError;

                // Step 3: Call the secure Edge Function to decrement inventory
                const itemsToUpdate = allUsedItems.map(item => ({
                    item_id: item.inventory_id,
                    amount: item.quantity
                }));

                const { error: functionError } = await supabase.functions.invoke('update-inventory', {
                    body: { items: itemsToUpdate },
                });

                if (functionError) {
                    // The error from an Edge Function can be a complex object.
                    // This logic attempts to find the clearest error message from it.
                    const context = functionError.context || {};
                    const errorBody = typeof context.json === 'function' ? await context.json().catch(()=>null) : null;
                    const message = (errorBody && errorBody.error) || functionError.message;
                    throw new Error(`Inventory update failed: ${message}`);
                }
            }
            
            // Step 4: Reset the UI for the next job
            resetState();

        } catch (err) {
            let errorMessage = 'An unknown error occurred.';
            if (err && err.message) {
               errorMessage = err.message;
            }
            setError(`Error: ${errorMessage}. Please check your inputs and try again.`);
            console.error("Detailed clock-out error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewProject = async (projectData) => {
        setLoading(true);
        try {
            // First, check if customer exists, if not create it
            let customerId;
            const { data: existingCustomer, error: customerSearchError } = await supabase
                .from('customers')
                .select('id')
                .eq('name', projectData.customer_name)
                .single();
            
            if (customerSearchError && customerSearchError.code === 'PGRST116') {
                // Customer doesn't exist, create it
                const { data: newCustomer, error: customerCreateError } = await supabase
                    .from('customers')
                    .insert({
                        name: projectData.customer_name,
                        email: '',
                        phone: '',
                        address: ''
                    })
                    .select('id')
                    .single();
                
                if (customerCreateError) throw customerCreateError;
                customerId = newCustomer.id;
            } else if (customerSearchError) {
                throw customerSearchError;
            } else {
                customerId = existingCustomer.id;
            }
            
            // Now create the project
            const { data: newProject, error } = await supabase
                .from('projects')
                .insert({
                    title: projectData.title,
                    customer_id: customerId,
                    status: 'Not Started' 
                })
                .select('id, title')
                .single();
            
            if (error) throw error;

            // Map title to name for local state consistency
            const newProjectEntry = { id: newProject.id, name: newProject.title };
            
            setProjects([newProjectEntry, ...projects]);
            setSelectedProject(newProjectEntry.id);
            setShowNewProjectModal(false);
            setSuccess(`Work order '${newProjectEntry.name}' created for ${projectData.customer_name}. You can now clock in.`);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createItemHandler = (items, setItems) => (inventory_id) => {
        if (!inventory_id || items.some(item => item.inventory_id === inventory_id)) return;
        setItems([...items, { inventory_id, quantity: '' }]);
    };

    const updateItemHandler = (items, setItems) => (index, newQuantity) => {
        const updatedItems = [...items];
        // Ensure quantity is always a number, default to 0 if input is invalid/empty
        updatedItems[index].quantity = Math.max(0, parseFloat(newQuantity) || 0);
        setItems(updatedItems);
    };
    
    const removeItemHandler = (items, setItems) => (index) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
    };

    const handleAddMaterial = createItemHandler(usedMaterials, setUsedMaterials);
    const handleUpdateMaterial = updateItemHandler(usedMaterials, setUsedMaterials);
    const handleRemoveMaterial = removeItemHandler(usedMaterials, setUsedMaterials);

    const handleAddConsumable = createItemHandler(usedConsumables, setUsedConsumables);
    const handleUpdateConsumable = updateItemHandler(usedConsumables, setUsedConsumables);
    const handleRemoveConsumable = removeItemHandler(usedConsumables, setUsedConsumables);

    const renderItemList = (title, itemList, availableItems, onAdd, onUpdate, onRemove) => {
        const selectedIds = new Set(itemList.map(i => i.inventory_id));
        return (
            <div style={styles.card}>
                <h3 style={styles.sectionTitle}>{title}</h3>
                {itemList.map((item, index) => {
                    const inventoryItem = inventory.find(i => i.id === item.inventory_id);
                    return (
                        <div key={index} style={styles.materialRow}>
                            <span style={{color: 'white', flexGrow: 1}}>{inventoryItem?.name}</span>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => onUpdate(index, parseFloat(e.target.value) || '')}
                                placeholder="Qty"
                                style={styles.quantityInput}
                            />
                            <span style={styles.unitLabel}>{inventoryItem?.unit || 'qty'}</span>
                             <button onClick={() => onRemove(index)} style={styles.removeButton}>&times;</button>
                        </div>
                    );
                })}
                 <select
                    onChange={(e) => onAdd(e.target.value)}
                    value=""
                    style={styles.select}
                >
                    <option value="">-- Add {title.slice(0,-1)} --</option>
                    {availableItems
                      .filter(i => !selectedIds.has(i.id))
                      .map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                    }
                </select>
            </div>
        );
    };


    if (loading && !user) return <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;

    return (
        <div style={styles.container}>
            {showNewProjectModal && <NewProjectModal customers={customers} onSave={handleAddNewProject} onCancel={() => setShowNewProjectModal(false)} />}
            
            <header style={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={styles.title}>Employee Timesheet</h1>
                    <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
                </div>
            </header>

            <main style={styles.main}>
                {error && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <div style={styles.card}>
                    {clockInTime ? (
                        <div style={{textAlign: 'center'}}>
                            <p style={{color: '#9ca3af', fontSize: '16px'}}>Clocked in on project:</p>
                            <p style={{fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '16px'}}>
                                {projects.find(p => p.id === selectedProject)?.name}
                            </p>
                            <div style={styles.timerDisplay}>
                                {formatTime(elapsedTime)}
                            </div>
                            <button 
                                onClick={handleClockOut} 
                                disabled={loading} 
                                style={{
                                    ...styles.button, 
                                    ...styles.clockOutButton,
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Submitting...' : 'CLOCK OUT'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                style={styles.select}
                            >
                                <option value="">-- Select Work Order --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button 
                                onClick={() => setShowNewProjectModal(true)} 
                                style={{...styles.button, ...styles.secondaryButton}}
                            >
                                + Create New Work Order
                            </button>
                            <button 
                                onClick={handleClockIn} 
                                disabled={!selectedProject || loading} 
                                style={{
                                    ...styles.button, 
                                    ...styles.clockInButton,
                                    opacity: (!selectedProject || loading) ? 0.6 : 1
                                }}
                            >
                                CLOCK IN
                            </button>
                        </div>
                    )}
                </div>

                {clockInTime && (
                    <div>
                        {renderItemList("Materials Used", usedMaterials, materials, handleAddMaterial, handleUpdateMaterial, handleRemoveMaterial)}
                        {renderItemList("Consumables Used", usedConsumables, consumables, handleAddConsumable, handleUpdateConsumable, handleRemoveConsumable)}

                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>Notes</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about the job..."
                                style={styles.textarea}
                            ></textarea>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EmployeeTimesheet; 