import re
from pathlib import Path

import PyPDF2
import docx
from accounts.models import User
from .models import Debt, DebtDetail, DebtReport


ALLOWED_EXTENSIONS = {'.pdf', '.docx'}


def extract_text_from_pdf(file_path):
    text = ''
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
    return text


def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return '\n'.join(para.text for para in doc.paragraphs if para.text)


def extract_text_from_file(file_path):
    extension = Path(file_path).suffix.lower()
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    if extension == '.docx':
        return extract_text_from_docx(file_path)
    raise ValueError('Unsupported file type')


def normalize_amount(value):
    return float(value.replace(',', '.')) if value else 0.0


def find_member_by_name(line):
    line_lower = line.lower()
    for user in User.objects.all():
        if user.full_name and user.full_name.lower() in line_lower:
            return user
    return None


def parse_debt_report(report):
    text = extract_text_from_file(report.file.path)
    if not text:
        return []

    lines = [line.strip() for line in text.replace('\r', '\n').split('\n') if line.strip()]
    unmatched_entries = []

    for line in lines:
        if not line or len(line) < 5:
            continue

        user = find_member_by_name(line)
        amounts = re.findall(r'[+-]?\d+[.,]?\d*', line)
        absence = 0.0
        late = 0.0
        total = None

        if 'absence' in line.lower():
            match = re.search(r'absence[:\s]*([+-]?\d+[.,]?\d*)', line, re.IGNORECASE)
            absence = normalize_amount(match.group(1)) if match else 0.0
        if 'late' in line.lower():
            match = re.search(r'late[:\s]*([+-]?\d+[.,]?\d*)', line, re.IGNORECASE)
            late = normalize_amount(match.group(1)) if match else 0.0
        if 'total' in line.lower():
            match = re.search(r'total[:\s]*([+-]?\d+[.,]?\d*)', line, re.IGNORECASE)
            total = normalize_amount(match.group(1)) if match else None

        if total is None and len(amounts) == 3:
            absence = normalize_amount(amounts[0])
            late = normalize_amount(amounts[1])
            total = normalize_amount(amounts[2])
        elif total is None and len(amounts) == 2:
            absence = normalize_amount(amounts[0])
            late = normalize_amount(amounts[1])
            total = absence + late
        else:
            total = absence + late

        if user:
            debt, _ = Debt.objects.get_or_create(user=user)
            if absence > 0:
                DebtDetail.objects.create(
                    debt=debt,
                    report=report,
                    amount=absence,
                    reason=f'Absence debt from report {report.id}',
                    date=report.uploaded_at.date(),
                )
                debt.total_absence_debt += absence
            if late > 0:
                DebtDetail.objects.create(
                    debt=debt,
                    report=report,
                    amount=late,
                    reason=f'Late debt from report {report.id}',
                    date=report.uploaded_at.date(),
                )
                debt.total_late_debt += late
            debt.total_debt = debt.total_absence_debt + debt.total_late_debt
            debt.save()
        else:
            unmatched_entries.append(line)

    report.is_parsed = True
    report.save()
    return unmatched_entries
