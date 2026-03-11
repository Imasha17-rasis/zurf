const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generate a PDF receipt for a booking payment
 * @param {Object} booking - Booking document with populated references
 * @param {Object} surfer - User document (surfer)
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateReceiptPDF = async (booking, surfer) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('📄 Starting PDF generation...');
            console.log('   Booking ID:', booking._id);
            console.log('   Surfer:', surfer?.name);
            console.log('   Guide:', booking.guide?.user?.name || (booking.guide ? 'Guide exists but no user' : 'No guide'));
            console.log('   Gears:', booking.gears?.length || 0);
            
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            // Capture PDF chunks as they're generated
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                console.log('✅ PDF generation complete');
                resolve(Buffer.concat(buffers));
            });
            doc.on('error', (err) => {
                console.error('❌ PDF generation error:', err);
                reject(err);
            });

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text('Zurf - Surf Spot Booking Platform', { align: 'center' });
            doc.fontSize(9).fillColor('#666').text('www.zurf.com', { align: 'center' });
            doc.fillColor('#000');
            doc.moveDown(1);

            // Receipt header line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.8);

            // Receipt Info Section
            doc.fontSize(11).font('Helvetica-Bold').text('Receipt Information', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.moveDown(0.3);

            const receiptDate = new Date();
            const receiptId = `REC-${booking._id.toString().slice(-8).toUpperCase()}-${receiptDate.getTime().toString().slice(-6)}`;

            doc.text(`Receipt ID: ${receiptId}`);
            doc.text(`Date: ${receiptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
            doc.text(`Time: ${receiptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`);

            doc.moveDown(0.8);

            // Customer Info Section
            doc.fontSize(11).font('Helvetica-Bold').text('Customer Information', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.moveDown(0.3);

            doc.text(`Name: ${surfer.name || 'N/A'}`);
            doc.text(`Email: ${surfer.email}`);
            if (surfer.phone) {
                doc.text(`Phone: ${surfer.phone}`);
            }

            doc.moveDown(0.8);

            // Booking Details Section
            doc.fontSize(11).font('Helvetica-Bold').text('Booking Summary', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.moveDown(0.3);

            // Format the booking date
            const bookingDate = new Date(booking.bookingDate);
            doc.text(`Surf Spot: ${booking.surfSpot.name || 'N/A'}`);
            doc.text(`Date: ${bookingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
            doc.text(`Time: ${booking.startTime}`);
            doc.text(`Duration: ${booking.durationHours} hour(s)`);

            if (booking.guide && booking.guide.user) {
                const guideName = booking.guide.user.name || 'N/A';
                doc.text(`Guide: ${guideName}`);
            } else {
                doc.text('Guide: None');
            }

            doc.moveDown(0.8);

            // Items Section
            if (booking.gears && Array.isArray(booking.gears) && booking.gears.length > 0) {
                const validGears = booking.gears.filter(item => item.gear);
                if (validGears.length > 0) {
                    doc.fontSize(11).font('Helvetica-Bold').text('Gear Rental', { underline: true });
                    doc.fontSize(10).font('Helvetica');
                    doc.moveDown(0.3);

                    validGears.forEach((gearItem, index) => {
                        const gearName = gearItem.gear?.name || 'Unknown Gear';
                        const quantity = gearItem.quantity || 1;
                        doc.text(`${index + 1}. ${gearName} x${quantity}`);
                    });

                    doc.moveDown(0.8);
                }
            }

            // Amount Section
            doc.fontSize(11).font('Helvetica-Bold').text('Amount', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.moveDown(0.3);

            const lineY = doc.y;
            doc.text('Subtotal:', 0, lineY);
            doc.text(`$${(booking.totalPrice).toFixed(2)}`, 0, lineY, { align: 'right' });

            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(12);
            const finalLineY = doc.y;
            doc.text('Amount Paid:', 0, finalLineY);
            doc.text(`$${(booking.totalPrice).toFixed(2)}`, 0, finalLineY, { align: 'right' });

            doc.moveDown(1);
            doc.font('Helvetica').fontSize(10);

            // Payment Status
            doc.fontSize(11).font('Helvetica-Bold').text('Payment Status', { underline: true });
            doc.fontSize(10).font('Helvetica');
            doc.moveDown(0.3);
            doc.fillColor('#27ae60').text('✓ Paid', { continued: false });
            doc.fillColor('#000');

            doc.moveDown(1.5);

            // Footer
            doc.fontSize(9).fillColor('#666');
            doc.text('Thank you for your booking! Please keep this receipt for your records.', { align: 'center' });
            doc.text('If you have any questions, please contact support@zurf.com', { align: 'center' });

            doc.moveTo(50, doc.y + 10).lineTo(545, doc.y + 10).stroke();
            doc.moveDown(0.5);
            doc.fontSize(8).text('Zurf © 2026. All rights reserved.', { align: 'center' });

            // Finalize the PDF
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
