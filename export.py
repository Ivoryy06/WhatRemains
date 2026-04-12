#!/usr/bin/env python3
"""
export.py - Export WhatRemains content to PDF
Usage: python export.py
Requires: pip install reportlab
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak

output = "WhatRemains_export.pdf"

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "GameTitle",
    parent=styles["Title"],
    fontSize=28,
    leading=34,
    textColor=colors.HexColor("#1a1a2e"),
    spaceAfter=6,
)

subtitle_style = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontSize=12,
    leading=16,
    textColor=colors.HexColor("#555577"),
    spaceAfter=20,
)

heading_style = ParagraphStyle(
    "SectionHeading",
    parent=styles["Heading1"],
    fontSize=12,
    leading=16,
    textColor=colors.HexColor("#1a1a2e"),
    spaceBefore=16,
    spaceAfter=6,
)

body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#333333"),
    spaceAfter=2,
)

label_style = ParagraphStyle(
    "Label",
    parent=styles["Normal"],
    fontSize=10,
    leading=14,
    textColor=colors.HexColor("#888888"),
    spaceAfter=20,
)

PAGES = [
    {
        "title": "What Remains",
        "subtitle": "A narrative exploration game",
        "body": "What Remains is a short, atmospheric exploration game about memory, loss, and the objects people leave behind. You play as someone returning to a family home after a death, piecing together a life through the things left in each room.",
    },
    {
        "title": "Concept",
        "subtitle": "Core idea",
        "body": "Each room holds objects. Each object holds a memory. The player uncovers the story not through dialogue or cutscenes, but through observation — reading notes, examining photographs, and listening to ambient sound.",
    },
    {
        "title": "Tone & Style",
        "subtitle": "Aesthetic direction",
        "body": "Quiet. Melancholic but not hopeless. Visually minimal — muted colors, soft lighting, no UI clutter. Inspired by Gone Home, Tacoma, and What Remains of Edith Finch.",
    },
    {
        "title": "Gameplay",
        "subtitle": "Mechanics",
        "body": "Walk through rooms. Pick up and inspect objects. Some trigger voiceover memories. No fail states, no timers. Estimated playtime: 30–45 minutes.",
    },
    {
        "title": "Technical",
        "subtitle": "Stack & tools",
        "body": "Built in Unity (URP). Rooms modeled in Blender. Audio designed in Reaper. Target platforms: PC and Mac via Steam.",
    },
]

def build():
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
    )

    story = []

    for i, page in enumerate(PAGES):
        story.append(Paragraph(page["title"], title_style))
        story.append(Paragraph(page["subtitle"], subtitle_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
        story.append(Spacer(1, 6*mm))
        story.append(Paragraph(page["body"], body_style))
        if i < len(PAGES) - 1:
            story.append(PageBreak())

    doc.build(story)
    print(f"Exported to {output}")

if __name__ == "__main__":
    build()
