// This file contains the JavaScript code for handling dynamic content and form handling for the invoice generator.

document.addEventListener('DOMContentLoaded', function () {
    const addServiceBtn = document.getElementById('add-service');
    const servicesBody = document.getElementById('services-body');
    const totalAmount = document.getElementById('total-amount');
    const generateInvoiceBtn = document.getElementById('generate-invoice');
    const exportButtons = document.getElementById('export-buttons');
    const printBtn = document.getElementById('print-invoice');
    const pdfBtn = document.getElementById('download-pdf');
    const shareBtn = document.getElementById('share-invoice');

    // Service options and their prices (null means manual entry)
    const serviceOptions = [
        { name: "CV creation", price: 70 },
        { name: "CV editing", price: 30 },
        { name: "Professional Resume Creation", price: 70 },
        { name: "Professional Resume Editing", price: 30 },
        { name: "Portfolio Website Creation", price: null },
        { name: "Portfolio Website Editing", price: null },
        { name: "Business Website Creation", price: null }
    ];

    // Add a new service row
    addServiceBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const row = document.createElement('tr');
        let optionsHtml = serviceOptions.map(opt => `<option value="${opt.name}">${opt.name}</option>`).join('');
        row.innerHTML = `
            <td>
                <select required>
                    <option value="" disabled selected>Select service</option>
                    ${optionsHtml}
                </select>
            </td>
            <td><input type="number" min="1" value="1" required></td>
            <td><input type="number" min="0" step="0.01" value="0.00" required></td>
            <td class="service-total">GH₵0.00</td>
            <td><button class="remove-service">Remove</button></td>
        `;
        servicesBody.appendChild(row);

        const select = row.querySelector('select');
        const priceInput = row.children[2].querySelector('input');

        // When a service is selected, set price if fixed, else allow manual entry
        select.addEventListener('change', function () {
            const selected = serviceOptions.find(opt => opt.name === select.value);
            if (selected && selected.price !== null) {
                priceInput.value = selected.price.toFixed(2);
                priceInput.readOnly = true;
            } else {
                priceInput.value = "";
                priceInput.readOnly = false;
            }
            updateTotals();
        });

        // Update total when quantity or price changes
        row.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', updateTotals);
        });

        // Remove row
        row.querySelector('.remove-service').addEventListener('click', function () {
            row.remove();
            updateTotals();
        });

        updateTotals();
    });

    // Update totals
    function updateTotals() {
        let total = 0;
        servicesBody.querySelectorAll('tr').forEach(row => {
            const qty = parseFloat(row.children[1].querySelector('input').value) || 0;
            const price = parseFloat(row.children[2].querySelector('input').value) || 0;
            const rowTotal = qty * price;
            row.querySelector('.service-total').textContent = 'GH₵' + rowTotal.toFixed(2);
            total += rowTotal;
        });
        totalAmount.textContent = 'GH₵' + total.toFixed(2);
    }

    // Helper to get customer name for filename
    function getCustomerName() {
        const nameInput = document.getElementById('customer-name');
        if (!nameInput) return 'Invoice';
        // Remove spaces and special characters for filename safety
        return nameInput.value.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Invoice';
    }

    // Generate Invoice: Hide all editing buttons, show export buttons, and auto-generate PDF
    generateInvoiceBtn.addEventListener('click', function () {
        document.querySelectorAll('.invoice-container button').forEach(btn => {
            btn.style.display = 'none';
        });
        exportButtons.style.display = 'block';
        setTimeout(() => {
            const element = document.querySelector('.invoice-container');
            const customerName = getCustomerName();
            html2pdf().from(element).save(`Saffire-Tech-Invoice-${customerName}.pdf`);
        }, 300);
        // Show export buttons after generating invoice
        exportButtons.style.display = 'block';
    });

    // Print Invoice
    printBtn.addEventListener('click', function () {
        window.print();
    });

    // Download as PDF (manual)
    pdfBtn.addEventListener('click', function () {
        const element = document.querySelector('.invoice-container');
        const customerName = getCustomerName();
        html2pdf().from(element).save(`Saffire-Tech-Invoice-${customerName}.pdf`);
    });

    // Share Invoice (Web Share API with PDF blob)
    shareBtn.addEventListener('click', async function () {
        const element = document.querySelector('.invoice-container');
        const customerName = getCustomerName();
        // Generate PDF as blob
        const opt = {
            margin: 0.5,
            filename: `Saffire-Tech-Invoice-${customerName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).outputPdf('blob').then(async function (blob) {
            if (navigator.canShare && navigator.canShare({ files: [new File([blob], opt.filename, { type: 'application/pdf' })] })) {
                const file = new File([blob], opt.filename, { type: 'application/pdf' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Saffire-Tech Invoice',
                        text: 'Please find attached your invoice from Saffire-Tech Consultancy.'
                    });
                } catch (err) {
                    alert('Sharing was cancelled or failed.');
                }
            } else {
                alert('Sharing is not supported on this device or browser.');
            }
        });
    });
});