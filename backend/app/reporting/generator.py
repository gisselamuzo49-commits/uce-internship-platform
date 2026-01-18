import pandas as pd
from fpdf import FPDF
from app.dao.factory import UCEFactory
import os

def generate_combined_report() -> str:
    factory = UCEFactory()
    try:
        s_dao = factory.get_student_dao()
        s_list = s_dao.get_all()
        s_df = pd.DataFrame(s_list)

        o_dao = factory.get_opportunity_dao()
        o_list = o_dao.get_all()
        o_df = pd.json_normalize(o_list) if o_list else pd.DataFrame()

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="Reporte SIIU Conecta", ln=1, align="C")
        
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, txt=f"Total Estudiantes: {len(s_df)}", ln=1)
        pdf.cell(0, 10, txt=f"Total Oportunidades: {len(o_df)}", ln=1)

        output_path = "reporte_uce.pdf"
        pdf.output(output_path)
        return os.path.abspath(output_path)
    finally:
        factory.close()