import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SESSIONS } from '../data/sessions';
import { SPEAKERS as SPEAKERS_ARRAY } from '../data/speakers';
import { CONFERENCE_STATS, AEROLAB_TRACKS } from '../data/conference-stats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure output directory exists
const outputDir = path.join(__dirname, '../public/documents');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'nbac-2027-brochure.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 15, left: 40, right: 40 },
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Theme Palette (Matching the Aeronautical Elite Dark Theme)
const COLORS = {
  canvas: '#101415',
  text: '#E0E3E5',
  muted: '#909097',
  gold: '#C5A059',
  goldLight: '#DFB76C',
  emerald: '#10B981',
  panel: '#1D2022',
  border: '#323537',
  white: '#FFFFFF'
};

// Draw Background helper
function drawBackground(doc: typeof PDFDocument) {
  doc.rect(0, 0, 595.28, 841.89).fill(COLORS.canvas);
  // Elegant gold geometric border line on left edge
  doc.rect(0, 0, 4, 841.89).fill(COLORS.gold);
}

// Draw Header helper
function drawPageHeader(doc: typeof PDFDocument, pageTitle: string) {
  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('NIGERIAN BUSINESS AVIATION CONFERENCE 2027', 40, 25, { characterSpacing: 1.5 });
  
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text(pageTitle.toUpperCase(), 40, 40);

  // Decorative line
  doc.moveTo(40, 65)
     .lineTo(555, 65)
     .strokeColor(COLORS.border)
     .lineWidth(1)
     .stroke();
}

// Draw Footer helper
function drawPageFooter(doc: typeof PDFDocument, pageNum: number) {
  doc.moveTo(40, 800)
     .lineTo(555, 800)
     .strokeColor(COLORS.border)
     .lineWidth(1)
     .stroke();

  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(8)
     .text('May 2027 | Lagos, Nigeria | Organised by EAN Aviation Limited', 40, 810);

  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(8)
     .text(`PAGE ${pageNum}`, 520, 810);
}

// Helper to get session start/end times
const getSessionTimes = (sessionsList: typeof SESSIONS, index: number, current: typeof SESSIONS[0]) => {
  const start_time = current.time;
  let end_time = '';
  // Find the next session on the same day
  const nextSession = sessionsList.slice(index + 1).find(s => s.day === current.day);
  if (nextSession) {
    end_time = nextSession.time;
  } else {
    // If it's the last session of the day
    if (current.day === 'day_1') {
      end_time = '22:00'; // Gala ends at 22:00
    } else {
      end_time = '18:00'; // Closing Cocktail ends at 18:00
    }
  }
  return { start_time, end_time };
};

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
drawBackground(doc);

// Elegant Gold Accents (Left and Top corners)
doc.lineWidth(1.5);
doc.strokeColor(COLORS.gold)
   .moveTo(40, 100)
   .lineTo(150, 100)
   .stroke();
doc.strokeColor(COLORS.gold)
   .moveTo(40, 100)
   .lineTo(40, 180)
   .stroke();

// Branding texts
doc.fillColor(COLORS.gold)
   .font('Helvetica-Bold')
   .fontSize(16)
   .text('THE 2ND ANNUAL', 40, 200, { characterSpacing: 2 });

doc.fillColor(COLORS.white)
   .font('Helvetica-Bold')
   .fontSize(38)
   .text('NIGERIAN BUSINESS', 40, 230)
   .text('AVIATION CONFERENCE', 40, 275);

doc.fillColor(COLORS.goldLight)
   .font('Helvetica-Bold')
   .fontSize(44)
   .text('NBAC 2027', 40, 330);

// Divider
doc.moveTo(40, 400)
   .lineTo(300, 400)
   .strokeColor(COLORS.gold)
   .lineWidth(2.5)
   .stroke();

// Tagline
doc.fillColor(COLORS.text)
   .font('Helvetica-Oblique')
   .fontSize(14)
   .text('Fly to the Future: Innovation, Sustainability & Leadership', 40, 420);

// Details Block
doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(11)
   .text('DATE:', 40, 680)
   .fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .text('MAY 2027', 100, 680);

doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(11)
   .text('VENUE:', 40, 700)
   .fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .text('MARRIOTT HOTEL, LAGOS, NIGERIA', 100, 700);

doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(11)
   .text('HOST:', 40, 720)
   .fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .text('EAN AVIATION LIMITED', 100, 720);

// ==========================================
// PAGE 2: CHAIRMAN'S WELCOME & STATS
// ==========================================
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Chairman's Welcome");

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(11)
   .text('Dear Delegates, Sponsors, Partners, and Distinguished Guests,', 40, 95);

const welcomeText = 
  "On behalf of the Steering Committee, I am immensely proud to welcome you to the 2nd annual Nigerian Business Aviation Conference (NBAC 2027).\n\n" +
  "West Africa's business aviation industry is entering a defining era. To scale and compete globally, operators, regulators, financiers, and technology innovators must build cohesive ecosystems. Under this year's theme, 'Fly to the Future', NBAC 2027 serves as the primary meeting point for elite decision-makers to tackle infrastructure challenges, align with regulatory frameworks, implement Sustainable Aviation Fuel (SAF) readiness, and explore artificial intelligence applications in operations.\n\n" +
  "Over the course of the next two days, you will engage in high-level networking, explore aircraft static displays, participate in peer-led panel discussions, and witness the next generation of aerospace entrepreneurs pitching at our AeroLab arena.\n\n" +
  "Thank you for your active commitment to shaping the skies of West Africa. We look forward to your valuable insights and partnerships.";

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10.5)
   .text(welcomeText, 40, 120, { width: 515, align: 'justify', lineGap: 4.5 });

// Signature block
doc.fillColor(COLORS.goldLight)
   .font('Helvetica-Bold')
   .fontSize(11)
   .text('Segun Demuren', 40, 395);

doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(9.5)
   .text('Chairman, NBAC Steering Committee · MD/CEO, EAN Aviation Limited', 40, 410);

// Render conference stats in 2x4 grid starting at y=440
const statsY = 440;
CONFERENCE_STATS.forEach((stat, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const x = 40 + col * 262; 
  const y = statsY + row * 78;

  doc.roundedRect(x, y, 252, 70, 6).fill(COLORS.panel);
  doc.roundedRect(x, y, 252, 70, 6).lineWidth(1).stroke(COLORS.border);
  doc.rect(x, y, 3, 70).fill(COLORS.gold);

  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(22)
     .text(stat.value, x + 15, y + 12);

  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text(stat.label.toUpperCase(), x + 15, y + 38, { width: 220, characterSpacing: 0.5 });
});

drawPageFooter(doc, 2);

// ==========================================
// PAGE 3: AEROLAB INNOVATION CHALLENGE
// ==========================================
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "AeroLab NBAC 2027");

doc.fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .fontSize(14)
   .text('PARALLEL INNOVATION CHALLENGE', 40, 95, { characterSpacing: 1.5 });

const aerolabDesc = 
  "Running alongside the main conference, AeroLab NBAC 2027 is the premier aviation hackathon in West Africa. " +
  "It brings together real aviation problems, built live by elite developer teams, and presented on stage to delegates and judges. " +
  "Over two days, ten finalist teams compete across five distinct challenge tracks for a grand prize and the coveted People's Choice Award.";

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10.5)
   .text(aerolabDesc, 40, 125, { width: 515, align: 'justify', lineGap: 5 });

// Render the 5 tracks
let trackY = 210;
AEROLAB_TRACKS.forEach((track) => {
  doc.roundedRect(40, trackY, 515, 65, 6).fill(COLORS.panel);
  doc.roundedRect(40, trackY, 515, 65, 6).lineWidth(1).stroke(COLORS.border);
  
  // Emerald indicator on the left
  doc.rect(40, trackY, 3, 65).fill(COLORS.emerald);

  doc.fillColor(COLORS.emerald)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(`TRACK 0${track.number}`, 60, trackY + 12);

  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(track.title, 60, trackY + 27);

  doc.fillColor(COLORS.muted)
     .font('Helvetica-Oblique')
     .fontSize(9.5)
     .text(track.subtitle, 60, trackY + 42);

  trackY += 75;
});

drawPageFooter(doc, 3);

// ==========================================
// PAGE 4+: FEATURED SPEAKERS
// ==========================================
let pageNumber = 4;
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Featured Speakers");
let yPos = 90;

const speakersList = SPEAKERS_ARRAY.filter(s => s.id !== 'host');

for (const spk of speakersList) {
  doc.font('Helvetica-Bold').fontSize(11);
  const nameHeight = doc.heightOfString(spk.name, { width: 475 });
  
  const orgOrTitle = `${spk.title}${spk.organisation ? ` — ${spk.organisation}` : ''}`;
  doc.font('Helvetica-Bold').fontSize(9);
  const titleHeight = doc.heightOfString(orgOrTitle, { width: 475 });
  
  doc.font('Helvetica').fontSize(8.5);
  const bioHeight = spk.bio ? doc.heightOfString(spk.bio, { width: 475, lineGap: 2.5 }) : 0;
  
  const padding = 10;
  const gap = 3;
  const cardHeight = padding * 2 + nameHeight + gap + titleHeight + (bioHeight ? gap + bioHeight : 0);
  
  if (yPos + cardHeight > 780) {
    drawPageFooter(doc, pageNumber);
    pageNumber++;
    
    doc.addPage();
    drawBackground(doc);
    drawPageHeader(doc, "Featured Speakers");
    yPos = 90;
  }
  
  doc.roundedRect(40, yPos, 515, cardHeight, 6).fill(COLORS.panel);
  doc.roundedRect(40, yPos, 515, cardHeight, 6).lineWidth(1).stroke(COLORS.border);
  doc.rect(40, yPos, 3, cardHeight).fill(COLORS.gold);

  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(spk.name, 60, yPos + padding);
  
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text(orgOrTitle, 60, yPos + padding + nameHeight + gap, { width: 475 });

  if (spk.bio) {
    doc.fillColor(COLORS.text)
       .font('Helvetica')
       .fontSize(8.5)
       .text(spk.bio, 60, yPos + padding + nameHeight + gap + titleHeight + gap, { width: 475, align: 'justify', lineGap: 2.5 });
  }

  yPos += cardHeight + 10;
}

drawPageFooter(doc, pageNumber);
pageNumber++;

// ==========================================
// AGENDA DRAWING FUNCTION
// ==========================================
function drawAgenda(doc: typeof PDFDocument, title: string, sessions: typeof SESSIONS, startPageNum: number) {
  let sessionIndex = 0;
  let pageNum = startPageNum;
  
  doc.addPage();
  drawBackground(doc);
  drawPageHeader(doc, title);
  let yPos = 90;
  
  while (sessionIndex < sessions.length) {
    const session = sessions[sessionIndex];
    
    // Calculate heights dynamically to avoid overlapping
    doc.font('Helvetica-Bold').fontSize(9.5);
    const titleHeight = doc.heightOfString(session.title, { width: 280 });
    
    doc.font('Helvetica').fontSize(8.5);
    const subtitleHeight = session.subtitle ? doc.heightOfString(session.subtitle, { width: 280 }) : 0;
    
    const panellistNames = (session.panellists || []).map(p => {
      return p.name + (p.organisation ? ` (${p.organisation})` : p.role ? ` (${p.role})` : '');
    }).join(', ');
    doc.font('Helvetica-Oblique').fontSize(8);
    const panellistsHeight = panellistNames ? doc.heightOfString(`Speakers: ${panellistNames}`, { width: 280 }) : 0;
    
    const padding = 10;
    const gap = 3;
    const cardHeight = padding * 2 + titleHeight + (subtitleHeight ? gap + subtitleHeight : 0) + (panellistsHeight ? gap + panellistsHeight : 0);
    
    if (yPos + cardHeight > 780) {
      drawPageFooter(doc, pageNum);
      pageNum++;
      
      doc.addPage();
      drawBackground(doc);
      drawPageHeader(doc, title);
      yPos = 90;
    }
    
    // Draw row container
    doc.roundedRect(40, yPos, 515, cardHeight, 6).fill(COLORS.panel);
    doc.roundedRect(40, yPos, 515, cardHeight, 6).lineWidth(1).stroke(COLORS.border);
    
    // Category indicator color
    let indicatorColor = COLORS.gold;
    const format = session.format;
    if (format === 'panel') indicatorColor = COLORS.emerald;
    else if (format === 'keynote' || format === 'presentation' || format === 'fireside') indicatorColor = COLORS.goldLight;
    else if (format === 'networking' || format === 'break') indicatorColor = COLORS.muted;
    else if (format === 'hackathon' || format === 'ceremony') indicatorColor = COLORS.emerald;
    doc.rect(40, yPos, 3, cardHeight).fill(indicatorColor);

    // Calculate times
    const { start_time, end_time } = getSessionTimes(sessions, sessionIndex, session);

    // Time Column
    doc.fillColor(COLORS.goldLight)
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(`${start_time} - ${end_time}`, 52, yPos + (cardHeight - 9) / 2);

    // Title
    doc.fillColor(COLORS.text)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(session.title, 160, yPos + padding, { width: 280 });
    
    // Subtitle
    let textOffset = padding + titleHeight;
    if (session.subtitle) {
      doc.fillColor(COLORS.muted)
         .font('Helvetica')
         .fontSize(8.5)
         .text(session.subtitle, 160, yPos + textOffset + gap, { width: 280 });
      textOffset += subtitleHeight + gap;
    }
    
    // Speakers
    if (panellistNames) {
      doc.fillColor(COLORS.muted)
         .font('Helvetica-Oblique')
         .fontSize(8)
         .text(`Speakers: ${panellistNames}`, 160, yPos + textOffset + gap, { width: 280 });
    }

    // Category Badge
    doc.fillColor(COLORS.white)
       .font('Helvetica-Bold')
       .fontSize(7.5)
       .text(format.toUpperCase(), 430, yPos + padding, { width: 110, align: 'right' });

    // Location / Note
    doc.fillColor(COLORS.muted)
       .font('Helvetica')
       .fontSize(8)
       .text(session.day === 'day_1' ? 'Marriott, Lagos' : 'TBC, Lagos', 430, yPos + padding + 15, { width: 110, align: 'right' });

    yPos += cardHeight + 6;
    sessionIndex++;
  }
  
  drawPageFooter(doc, pageNum);
  pageNum++;
  
  return pageNum;
}

const day1Sessions = SESSIONS.filter(s => s.day === 'day_1');
const day2Sessions = SESSIONS.filter(s => s.day === 'day_2');

pageNumber = drawAgenda(doc, "Program Agenda — Day 1", day1Sessions, pageNumber);
pageNumber = drawAgenda(doc, "Program Agenda — Day 2", day2Sessions, pageNumber);

doc.end();

writeStream.on('finish', () => {
  console.log('NBAC 2027 Brochure PDF generated successfully!');
});
writeStream.on('error', (err) => {
  console.error('Error writing PDF brochure:', err);
});
