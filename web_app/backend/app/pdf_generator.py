from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib import colors
from datetime import datetime
from io import BytesIO
import os

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#0066cc'),
            spaceAfter=30,
            alignment=1  # Center
        ))
        
        self.styles.add(ParagraphStyle(
            name='ResultLabel',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#333333'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        ))
    
    def generate_pdf(self, analysis_data, patient_name=None, patient_id=None, patient_email=None):
        """Generate PDF report from analysis data"""
        # Use provided patient info or fallback to defaults
        if not patient_name:
            patient_name = analysis_data.get('patient_name', 'Patient')
        if not patient_id:
            patient_id = analysis_data.get('patient_id', 'Not Provided')
        if not patient_email:
            patient_email = analysis_data.get('patient_email', 'Not Provided')
            
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        story = []
        
        # Title
        title = Paragraph("🧠 Brain Tumor Detection Report", self.styles['CustomTitle'])
        story.append(title)
        
        # Report Date
        report_date = Paragraph(
            f"<b>Report Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            self.styles['Normal']
        )
        story.append(report_date)
        story.append(Spacer(1, 0.2*inch))
        
        # Patient Info
        story.append(Paragraph("<b>Patient Information</b>", self.styles['Heading2']))
        report_id = analysis_data.get('analysis_id') or analysis_data.get('_id') or 'Not Provided'
        analysis_timestamp = analysis_data.get('timestamp') or analysis_data.get('analysis_date') or 'Not Provided'
        patient_info = [
            ["Patient Name:", patient_name if patient_name else "Not Provided"],
            ["Patient Email:", patient_email if patient_email else "Not Provided"],
            ["Patient ID:", patient_id if patient_id else "Not Provided"],
            ["Report ID:", str(report_id)],
            ["Analysis Date:", str(analysis_timestamp)],
        ]
        patient_table = Table(patient_info, colWidths=[2*inch, 3*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Analysis Results
        story.append(Paragraph("<b>Analysis Results</b>", self.styles['Heading2']))
        
        # Result Status
        is_tumor = analysis_data.get('is_tumor', False)
        result_status = "🚨 TUMOR DETECTED" if is_tumor else "✅ NORMAL"
        result_color = colors.HexColor('#dc3545') if is_tumor else colors.HexColor('#28a745')
        
        result_para = Paragraph(
            f"<font color='#{result_color.hexval()}' size='14'><b>{result_status}</b></font><br/>"
            f"<b>Classification:</b> {analysis_data.get('label', 'Unknown')}<br/>"
            f"<b>Confidence Level:</b> {(analysis_data.get('confidence', 0) * 100):.2f}%",
            self.styles['Normal']
        )
        story.append(result_para)
        story.append(Spacer(1, 0.2*inch))
        
        # Probability Distribution
        predictions = analysis_data.get('predictions', {})
        prob_data = [
            ["Classification", "Probability"],
            ["Normal", f"{(predictions.get('normal', 0) * 100):.2f}%"],
            ["Tumor", f"{(predictions.get('tumor', 0) * 100):.2f}%"],
        ]
        prob_table = Table(prob_data, colWidths=[3*inch, 2*inch])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0066cc')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        ]))
        story.append(prob_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Medical Disclaimer
        disclaimer = Paragraph(
            "<b>⚕️ Medical Disclaimer:</b><br/>"
            "This analysis is AI-assisted and should not be used as a sole diagnostic tool. "
            "Always consult with a qualified medical professional for accurate diagnosis and treatment. "
            "This report is for informational purposes only.",
            self.styles['Normal']
        )
        story.append(disclaimer)
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer
