function generatePDF() {
    const element = document.getElementById('invoice'); // Assuming the invoice has an ID of 'invoice'
    html2pdf()
        .from(element)
        .save('invoice.pdf');
}

document.getElementById('download-pdf').addEventListener('click', generatePDF); // Assuming there's a button with ID 'download-pdf' to trigger the PDF generation