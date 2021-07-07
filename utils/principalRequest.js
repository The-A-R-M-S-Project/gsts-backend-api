const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const sendEmail = require('./email');

module.exports = {
  sendExaminerInvitation: async examiner => {
    const pathToFile = path.resolve(__dirname, '../assets/private/principalRequest.pdf');
    const pathToMukLog = path.resolve(__dirname, '../assets/private/makererelogo.png');
    const principalRequest = `Dear ${examiner.firstName} ${examiner.lastName},
      
You have been invited to assess a student's report at Makerere University.

Login in to your dashboard using the following link to see further details.
http://161.35.252.183:8020/

Attached to this email is a letter from the university officially inviting to carry out this role.

Kind Regards,
Principal Cedat`;

    // 1: Create a document
    const doc = new PDFDocument();

    // 2: Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream(pathToFile));

    // 3: Create the pdf body
    const pdfBody = `The College of Design, Engineering, Art and Technology (CEDAT) warmly invite you to assess a student's report.

Kind Regards,
Principal Cedat.`;

    doc.font('Times-Bold');
    doc.fontSize(16);
    doc.image(pathToMukLog, 250, 50, { fit: [100, 100] }).text('MAKERERE', 150, 115);

    doc.text('UNIVERSITY', 355, 115);
    doc.text('', 100, 150);

    doc
      .font('Times-Roman')
      .fontSize(20)
      .text("INVITATION TO ASSESS STUDENT'S REPORT", { align: 'center' })
      .moveDown(1);

    doc.fontSize(12);

    // Using a standard PDF font
    doc.font('Times-Roman').text(pdfBody);

    // Finalize PDF file
    doc.end();

    const attachments = [
      {
        filename: 'principalRequest.pdf',
        path: pathToFile
      }
    ];

    try {
      await sendEmail({
        email: examiner.email,
        subject: `Examiner invitation`,
        message: principalRequest,
        attachments
      });
    } catch (error) {
      return error;
    }

    return 'success';
  },
  sendExaminerRequest: async (dean, report) => {
    const pathToFile = path.resolve(__dirname, '../assets/private/principalRequest.pdf');
    const pathToMukLog = path.resolve(__dirname, '../assets/private/makererelogo.png');

    const principalRequest = `Dear ${dean.name},

I am kindly requesting you to provide a list of examiners for ${report.student.name} from the ${dean.school.name};

Kind Regards,
Pricipal Cedat.`;

    // 1: Create a document
    const doc = new PDFDocument();

    // 2: Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream(pathToFile));

    // Embed a font, set the font size, and render some text
    doc.font('Times-Bold');
    doc.fontSize(16);
    doc.image(pathToMukLog, 250, 50, { fit: [100, 100] }).text('MAKERERE', 150, 115);

    doc.text('UNIVERSITY', 355, 115);
    doc.text('', 100, 150);

    doc
      .font('Courier')
      .fontSize(20)
      .text('PRINCIPAL REQUEST FOR LIST OF EXAMINERS TO STUDENT.', { align: 'center' })
      .moveDown(1);

    doc.fontSize(12);

    // Using a standard PDF font
    doc
      .font('Times-Roman')
      .text(principalRequest)
      .moveDown();

    // Finalize PDF file
    doc.end();

    const attachments = [
      {
        filename: 'principalRequest.pdf',
        path: pathToFile
      }
    ];

    try {
      await sendEmail({
        email: dean.email,
        subject: `Request to assign examiners to students of the ${dean.school.name}`,
        message: principalRequest,
        attachments
      });
    } catch (error) {
      return error;
    }
    return 'success';
  },
  withdrawExaminerRequest: async (examiner, report) => {
    const principalRequest = `Dear ${examiner.name},

You have been withdrawn from assessment of a student's report at Makerere University for the student with name ${report.student.firstName} ${report.student.lastName}.

Kind Regards,
Pricipal Cedat.`;

    try {
      await sendEmail({
        email: examiner.email,
        subject: `Notification of withdrawal from student report`,
        message: principalRequest
      });
    } catch (error) {
      return error;
    }
    return 'success';
  }
};
