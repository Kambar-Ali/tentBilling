document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;

    const dateInput = document.getElementById('bill-date');
    dateInput.valueAsDate = new Date();

    const addRowBtn = document.getElementById('add-row-btn');
    const itemsBody = document.getElementById('items-body');

    addRowBtn.addEventListener('click', () => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="material-name" required></td>
            <td><input type="number" class="quantity" min="1" required></td>
            <td><input type="number" class="price" min="0" step="0.01" required></td>
            <td class="total">0.00</td>
        `;
        itemsBody.appendChild(newRow);
        attachCalculationListeners(newRow);
    });

    function attachCalculationListeners(row) {
        const quantityInput = row.querySelector('.quantity');
        const priceInput = row.querySelector('.price');
        const totalCell = row.querySelector('.total');

        function calculateTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = (quantity * price).toFixed(2);
            totalCell.textContent = total;
            updateGrandTotal();
        }

        quantityInput.addEventListener('input', calculateTotal);
        priceInput.addEventListener('input', calculateTotal);
    }

    attachCalculationListeners(itemsBody.querySelector('tr'));

    function updateGrandTotal() {
        const totalCells = document.querySelectorAll('.total');
        const grandTotalValue = document.getElementById('grand-total-value');
        let grandTotal = 0;

        totalCells.forEach(cell => {
            grandTotal += parseFloat(cell.textContent) || 0;
        });

        grandTotalValue.textContent = grandTotal.toFixed(2);
    }

    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    generatePdfBtn.addEventListener('click', generatePDF);

    function generatePDF() {
        const customerName = document.getElementById('customer-name').value.trim();
        const customerContact = document.getElementById('customer-contact').value.trim();
        
        if (!customerName || !customerContact) {
            alert('Please fill in customer name and contact number.');
            return;
        }

        const billDate = document.getElementById('bill-date').value;
        const grandTotal = document.getElementById('grand-total-value').textContent;

        const doc = new jsPDF();
        
        doc.autoTable({
            styles: { fontSize: 10 },
            margin: { top: 50 },
            head: [['Material Name', 'Quantity', 'Price per Unit', 'Total']],
            body: getTableData(),
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        doc.setFontSize(14);
        doc.text('Rahat Tent House', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Mohalla Kot, Near Shahi Jama Masjid, Barwar Kheri', doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });
        doc.text('Rahat Zaidi: +918299001510 | Haider Abbas: +919936298868', doc.internal.pageSize.getWidth() / 2, 34, { align: 'center' });

        doc.text(`Customer Name: ${customerName}`, 15, 45);
        doc.text(`Contact: ${customerContact}`, 15, 40);
        doc.text(`Date: ${billDate}`, 135, 45);

        doc.text(`Grand Total: ${grandTotal}`, 15, doc.autoTable.previous.finalY + 10);

        doc.text('Thank you for choosing Rahat Tent House!', doc.internal.pageSize.getWidth() / 2, doc.autoTable.previous.finalY + 20, { align: 'center' });

        doc.text('© 2025 Rahat Tent House | Developed by (Kambar Ali) Prince Zaidi (+91 9125241370)', 
            doc.internal.pageSize.getWidth() / 2, 
            doc.internal.pageSize.getHeight() - 10, 
            { align: 'center' }
        );

        doc.save(`${customerName}_Bill.pdf`);
    }

    function getTableData() {
        const tableRows = document.querySelectorAll('#items-body tr');
        return Array.from(tableRows).map(row => {
            const materialName = row.querySelector('.material-name').value;
            const quantity = row.querySelector('.quantity').value;
            const price = row.querySelector('.price').value;
            const total = row.querySelector('.total').textContent;
            return [materialName, quantity, price, total];
        }).filter(row => row[0] !== '');
    }
});