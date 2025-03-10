jQuery(document).ready(function($) {
    // Handle manual database input toggle
    $('#manual_db').on('change', function() {
        const $wrapper = $('.database-select-container');
        const $refreshButton = $('.refresh-databases');
        const isManual = $(this).is(':checked');
        const currentValue = $('#odoo_database').val();
        
        if (isManual) {
            $wrapper.html('<input type="text" name="odoo_database" id="odoo_database" value="' + currentValue + '" class="regular-text manual-db-input">');
            $refreshButton.hide();
        } else {
            $refreshButton.show();
            // Make the AJAX call to refresh databases
            $.ajax({
                url: odooflow.ajax_url,
                type: 'POST',
                data: {
                    action: 'refresh_odoo_databases',
                    nonce: odooflow.nonce
                },
                success: function(response) {
                    if (response.success) {
                        $wrapper.html(response.data.html);
                    } else {
                        $wrapper.html('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                    }
                },
                error: function() {
                    $wrapper.html('<div class="notice notice-error"><p>Error refreshing databases. Please try again.</p></div>');
                }
            });
        }
    });

    $('.refresh-databases').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $wrapper = $button.closest('.odoo-database-wrapper');
        
        $button.prop('disabled', true);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: {
                action: 'refresh_odoo_databases',
                nonce: odooflow.nonce
            },
            success: function(response) {
                if (response.success) {
                    $wrapper.find('select').replaceWith(response.data.html);
                } else {
                    $wrapper.find('.notice').remove();
                    $wrapper.prepend('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function() {
                $wrapper.find('.notice').remove();
                $wrapper.prepend('<div class="notice notice-error"><p>Error refreshing databases. Please try again.</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false);
            }
        });
    });

    $('.list-modules').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $modulesList = $('#odoo-modules-list .modules-content');
        
        $button.prop('disabled', true);
        $modulesList.html('<div class="notice notice-info"><p>Loading modules...</p></div>');
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: {
                action: 'list_odoo_modules',
                nonce: odooflow.nonce
            },
            success: function(response) {
                if (response.success) {
                    $modulesList.html(response.data.html);
                } else {
                    $modulesList.html('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function() {
                $modulesList.html('<div class="notice notice-error"><p>Error fetching modules. Please try again.</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false);
            }
        });
    });

    // Handle Odoo products count button
    $('.get-odoo-products-count').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $result = $button.siblings('.odoo-products-count-result');
        
        $button.prop('disabled', true);
        $result.html('<span class="spinner is-active"></span> Loading...');
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: {
                action: 'get_odoo_products_count',
                nonce: odooflow.nonce
            },
            success: function(response) {
                if (response.success) {
                    $result.html('<div class="notice notice-success"><p>' + response.data.message + '</p></div>');
                } else {
                    $result.html('<div class="notice notice-error"><p>' + response.data.message + '</p></div>');
                }
            },
            error: function() {
                $result.html('<div class="notice notice-error"><p>Error fetching product count. Please try again.</p></div>');
            },
            complete: function() {
                $button.prop('disabled', false);
            }
        });
    });

    // Modal handling
    const modal = $('#odoo-products-modal');
    const modalClose = $('.odoo-modal-close');
    const productsList = $('.odoo-products-list');
    
    // Close modal when clicking the close button or outside the modal
    modalClose.on('click', function() {
        modal.hide();
    });
    
    $(window).on('click', function(event) {
        if (event.target === modal[0]) {
            modal.hide();
        }
    });
    
    // Get Odoo Products button click handler
    $('.get-odoo-products').on('click', function() {
        const loadingOverlay = $('<div class="loading-overlay"><div class="loading-spinner"></div></div>');
        productsList.append(loadingOverlay);
        modal.show();
        
        // Get selected fields
        const selectedFields = getSelectedFields();
        
        // Debug log the request data
        const requestData = {
            action: 'get_odoo_products',
            nonce: odooflow.nonce,
            fields: selectedFields
        };
        console.log('Sending request with data:', requestData);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: requestData,
            success: function(response) {
                console.log('Response:', response);
                if (response.success) {
                    productsList.html(response.data.html);
                } else {
                    const errorMessage = response.data ? response.data.message : 'Unknown error occurred';
                    productsList.html('<div class="notice notice-error"><p>' + errorMessage + '</p></div>');
                    console.error('Error response:', response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error details:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText,
                    textStatus: textStatus,
                    errorThrown: errorThrown,
                    headers: jqXHR.getAllResponseHeaders()
                });
                productsList.html('<div class="notice notice-error"><p>Error fetching products. Status: ' + textStatus + '</p><p>Details: ' + errorThrown + '</p></div>');
            },
            complete: function() {
                loadingOverlay.remove();
            }
        });
    });
    
    // Helper function to get selected fields
    function getSelectedFields() {
        const fields = $('input[name="import_fields[]"]:checked').map(function() {
            return this.value;
        }).get();
        
        // Ensure required fields are always included
        if (!fields.includes('name')) {
            fields.push('name');
        }
        if (!fields.includes('default_code')) {
            fields.push('default_code');
        }
        
        return fields;
    }
    
    // Field selection handlers
    $('.select-all-fields').on('click', function() {
        $('input[name="import_fields[]"]:not(:disabled)').prop('checked', true);
    });
    
    $('.deselect-all-fields').on('click', function() {
        // Don't deselect required fields
        $('input[name="import_fields[]"]:not(:disabled):not([value="name"]):not([value="default_code"])').prop('checked', false);
    });
    
    // Product selection handlers
    $(document).on('click', '#select-all-products', function() {
        $('input[name="import_products[]"]').prop('checked', this.checked);
    });
    
    $('.select-all-products').on('click', function() {
        $('input[name="import_products[]"]').prop('checked', true);
        $('#select-all-products').prop('checked', true);
    });
    
    $('.deselect-all-products').on('click', function() {
        $('input[name="import_products[]"]').prop('checked', false);
        $('#select-all-products').prop('checked', false);
    });
    
    // Import selected products
    $('.import-selected-products').on('click', function() {
        const selectedProducts = $('input[name="import_products[]"]:checked').map(function() {
            return parseInt(this.value, 10);
        }).get();
        
        if (selectedProducts.length === 0) {
            alert('Please select at least one product to import');
            return;
        }
        
        const selectedFields = getSelectedFields();
        
        // No need to check for name-only since SKU is now required
        if (selectedFields.length <= 2) {
            alert('Please select at least one additional field to import');
            return;
        }
        
        const loadingOverlay = $('<div class="loading-overlay"><div class="loading-spinner"></div></div>');
        $('.odoo-modal-content').append(loadingOverlay);

        // Debug log the request data
        const requestData = {
            action: 'import_selected_products',
            nonce: odooflow.nonce,
            product_ids: selectedProducts,
            fields: selectedFields
        };
        console.log('Sending import request with data:', requestData);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: requestData,
            success: function(response) {
                console.log('Import response:', response);
                if (response.success) {
                    let message = response.data.message;
                    if (response.data.details) {
                        message += '\n\nDetails:' + response.data.details;
                    }
                    alert(message);
                    if (response.data.new > 0 || response.data.updated > 0) {
                        // Reload the page to show new/updated products
                        window.location.reload();
                    }
                } else {
                    const errorMessage = response.data ? response.data.message : 'Unknown error occurred';
                    alert('Error: ' + errorMessage);
                    console.error('Import error:', response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Import AJAX error:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText,
                    textStatus: textStatus,
                    errorThrown: errorThrown
                });
                alert('Error importing products. Status: ' + textStatus + '\nDetails: ' + errorThrown);
            },
            complete: function() {
                loadingOverlay.remove();
            }
        });
    });

    // Export to Odoo button click handler
    $('.export-to-odoo').on('click', function() {
        const exportModal = $('#odoo-export-modal');
        const wooProductsList = $('.woo-products-list');
        const loadingOverlay = $('<div class="loading-overlay"><div class="loading-spinner"></div></div>');
        wooProductsList.append(loadingOverlay);
        exportModal.show();
        
        // Get selected fields
        const selectedFields = getSelectedExportFields();
        
        // Debug log the request data
        const requestData = {
            action: 'get_woo_products',
            nonce: odooflow.nonce,
            fields: selectedFields
        };
        console.log('Sending request with data:', requestData);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: requestData,
            success: function(response) {
                console.log('Response:', response);
                if (response.success) {
                    wooProductsList.html(response.data.html);
                } else {
                    const errorMessage = response.data ? response.data.message : 'Unknown error occurred';
                    wooProductsList.html('<div class="notice notice-error"><p>' + errorMessage + '</p></div>');
                    console.error('Error response:', response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('AJAX error details:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText,
                    textStatus: textStatus,
                    errorThrown: errorThrown
                });
                wooProductsList.html('<div class="notice notice-error"><p>Error fetching products. Status: ' + textStatus + '</p><p>Details: ' + errorThrown + '</p></div>');
            },
            complete: function() {
                loadingOverlay.remove();
            }
        });
    });

    // Helper function to get selected export fields
    function getSelectedExportFields() {
        const fields = $('input[name="export_fields[]"]:checked').map(function() {
            return this.value;
        }).get();
        
        // Ensure required fields are always included
        if (!fields.includes('name')) {
            fields.push('name');
        }
        if (!fields.includes('default_code')) {
            fields.push('default_code');
        }
        
        return fields;
    }

    // Export modal close handler
    $('#odoo-export-modal .odoo-modal-close').on('click', function() {
        $('#odoo-export-modal').hide();
    });

    // Export field selection handlers
    $('.select-all-export-fields').on('click', function() {
        $('input[name="export_fields[]"]:not(:disabled)').prop('checked', true);
    });
    
    $('.deselect-all-export-fields').on('click', function() {
        $('input[name="export_fields[]"]:not(:disabled):not([value="name"]):not([value="default_code"])').prop('checked', false);
    });
    
    // WooCommerce product selection handlers
    $(document).on('click', '#select-all-woo-products', function() {
        $('input[name="export_products[]"]').prop('checked', this.checked);
    });
    
    $('.select-all-woo-products').on('click', function() {
        $('input[name="export_products[]"]').prop('checked', true);
        $('#select-all-woo-products').prop('checked', true);
    });
    
    $('.deselect-all-woo-products').on('click', function() {
        $('input[name="export_products[]"]').prop('checked', false);
        $('#select-all-woo-products').prop('checked', false);
    });
    
    // Export selected products
    $('.export-selected-products').on('click', function() {
        const selectedProducts = $('input[name="export_products[]"]:checked').map(function() {
            return parseInt(this.value, 10);
        }).get();
        
        if (selectedProducts.length === 0) {
            alert('Please select at least one product to export');
            return;
        }
        
        const selectedFields = getSelectedExportFields();
        
        if (selectedFields.length <= 2) {
            alert('Please select at least one additional field to export');
            return;
        }
        
        const loadingOverlay = $('<div class="loading-overlay"><div class="loading-spinner"></div></div>');
        $('.odoo-modal-content').append(loadingOverlay);

        // Debug log the request data
        const requestData = {
            action: 'export_selected_products',
            nonce: odooflow.nonce,
            product_ids: selectedProducts,
            fields: selectedFields
        };
        console.log('Sending export request with data:', requestData);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: requestData,
            success: function(response) {
                console.log('Export response:', response);
                if (response.success) {
                    let message = response.data.message;
                    if (response.data.details) {
                        message += '\n\nDetails:' + response.data.details;
                    }
                    alert(message);
                    $('#odoo-export-modal').hide();
                } else {
                    const errorMessage = response.data ? response.data.message : 'Unknown error occurred';
                    alert('Error: ' + errorMessage);
                    console.error('Export error:', response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Export AJAX error:', {
                    status: jqXHR.status,
                    statusText: jqXHR.statusText,
                    responseText: jqXHR.responseText,
                    textStatus: textStatus,
                    errorThrown: errorThrown
                });
                alert('Error exporting products. Status: ' + textStatus + '\nDetails: ' + errorThrown);
            },
            complete: function() {
                loadingOverlay.remove();
            }
        });
    });

    // Customer sync button handlers
    $('.odooflow-import-customers').on('click', function() {
        const $button = $(this);
        const $notice = $('<div class="notice notice-info is-dismissible"><p>Importing customers from Odoo...</p></div>');
        
        $button.prop('disabled', true);
        $button.after($notice);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: {
                action: 'import_odoo_customers',
                nonce: odooflow.nonce
            },
            success: function(response) {
                $notice.removeClass('notice-info').addClass(response.success ? 'notice-success' : 'notice-error');
                $notice.find('p').text(response.data.message);
                if (response.success) {
                    // Reload the page after 2 seconds to show the new customers
                    setTimeout(function() {
                        window.location.reload();
                    }, 2000);
                }
            },
            error: function() {
                $notice.removeClass('notice-info').addClass('notice-error');
                $notice.find('p').text('Error importing customers. Please try again.');
            },
            complete: function() {
                $button.prop('disabled', false);
            }
        });
    });

    $('.odooflow-export-customers').on('click', function() {
        const $button = $(this);
        const $notice = $('<div class="notice notice-info is-dismissible"><p>Exporting customers to Odoo...</p></div>');
        
        $button.prop('disabled', true);
        $button.after($notice);
        
        $.ajax({
            url: odooflow.ajax_url,
            type: 'POST',
            data: {
                action: 'export_woo_customers',
                nonce: odooflow.nonce
            },
            success: function(response) {
                $notice.removeClass('notice-info').addClass(response.success ? 'notice-success' : 'notice-error');
                $notice.find('p').text(response.data.message);
            },
            error: function() {
                $notice.removeClass('notice-info').addClass('notice-error');
                $notice.find('p').text('Error exporting customers. Please try again.');
            },
            complete: function() {
                $button.prop('disabled', false);
            }
        });
    });
}); 