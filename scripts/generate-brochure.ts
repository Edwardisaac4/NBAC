import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPEAKERS, MOCK_EVENTS } from '../lib/mock-events';
import { EventSession, Speaker } from '../types';

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

// Filter out Master of Ceremonies / Host from featured speakers
const speakersList = Object.values(SPEAKERS).filter(s => s.id !== 'host');

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
     .fontSize(22)
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
     .text('May 4-5, 2027 | Marriott Hotel, Ikeja, Lagos', 40, 810);

  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(8)
     .text(`PAGE ${pageNum}`, 520, 810);
}

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
   .text('MAY 4 - 5, 2027', 100, 680);

doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(11)
   .text('VENUE:', 40, 700)
   .fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .text('MARRIOTT HOTEL, IKEJA, LAGOS', 100, 700);

doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(11)
   .text('HOST:', 40, 720)
   .fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .text('NBAC STEERING COMMITTEE', 100, 720);

// ==========================================
// PAGE 2: CHAIRMAN'S WELCOME
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
   .text(welcomeText, 40, 125, { width: 515, align: 'justify', lineGap: 6 });

// Signature block
doc.fillColor(COLORS.goldLight)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('Segun Demuren', 40, 420);

doc.fillColor(COLORS.muted)
   .font('Helvetica')
   .fontSize(10)
   .text('Chairman, NBAC Steering Committee', 40, 435);

// Event statistics box (Premium Glassmorphic imitation)
doc.roundedRect(40, 480, 515, 120, 8).fill(COLORS.panel);
doc.roundedRect(40, 480, 515, 120, 8).lineWidth(1).stroke(COLORS.border);

// Stat 1
doc.fillColor(COLORS.gold)
   .font('Helvetica-Bold')
   .fontSize(28)
   .text('300+', 70, 510);
doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('Delegates', 70, 545);

// Stat 2
doc.fillColor(COLORS.gold)
   .font('Helvetica-Bold')
   .fontSize(28)
   .text('30+', 250, 510);
doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('AeroLab Finalists', 250, 545);

// Stat 3 (Derived from speakersList)
doc.fillColor(COLORS.gold)
   .font('Helvetica-Bold')
   .fontSize(28)
   .text(`${speakersList.length}+`, 420, 510);
doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('Expert Speakers', 420, 545);

drawPageFooter(doc, 2);

// ==========================================
// PAGE 3+: FEATURED SPEAKERS
// ==========================================
let speakerIndex = 0;
let pageNumber = 3;

doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Featured Speakers");
let yPos = 90;

while (speakerIndex < speakersList.length) {
  const spk = speakersList[speakerIndex];
  
  // Calculate text heights dynamically to ensure perfect padding and zero overflow/overlaps
  doc.font('Helvetica-Bold').fontSize(13);
  const nameHeight = doc.heightOfString(spk.name, { width: 475 });
  
  doc.font('Helvetica-Bold').fontSize(10);
  const companyOrOrg = spk.company || spk.organisation || '';
  const titleString = `${spk.title}${companyOrOrg ? ` — ${companyOrOrg}` : ''}`;
  const titleHeight = doc.heightOfString(titleString, { width: 475 });
  
  doc.font('Helvetica').fontSize(9.5);
  const bioHeight = spk.bio ? doc.heightOfString(spk.bio, { width: 475, lineGap: 3 }) : 0;
  
  const padding = 14;
  const gap = 5;
  const cardHeight = padding * 2 + nameHeight + gap + titleHeight + (bioHeight ? gap + bioHeight : 0);
  
  // Check if card fits on page, otherwise paginate cleanly
  if (yPos + cardHeight > 780) {
    drawPageFooter(doc, pageNumber);
    pageNumber++;
    
    doc.addPage();
    drawBackground(doc);
    drawPageHeader(doc, "Featured Speakers");
    yPos = 90;
  }
  
  // Draw card (Rounded container)
  doc.roundedRect(40, yPos, 515, cardHeight, 8).fill(COLORS.panel);
  doc.roundedRect(40, yPos, 515, cardHeight, 8).lineWidth(1).stroke(COLORS.border);
  
  // Decorative small gold line inside left edge
  doc.rect(40, yPos, 3, cardHeight).fill(COLORS.gold);

  // Speaker Details
  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(13)
     .text(spk.name, 60, yPos + padding);
  
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(titleString, 60, yPos + padding + nameHeight + gap, { width: 475 });

  if (spk.bio) {
    doc.fillColor(COLORS.text)
       .font('Helvetica')
       .fontSize(9.5)
       .text(spk.bio, 60, yPos + padding + nameHeight + gap + titleHeight + gap, { width: 475, align: 'justify', lineGap: 3 });
  }

  yPos += cardHeight + 12;
  speakerIndex++;
}

drawPageFooter(doc, pageNumber);
pageNumber++;

// ==========================================
// AGENDA DRAWING FUNCTION
// ==========================================
function drawAgenda(doc: typeof PDFDocument, title: string, sessions: EventSession[], startPageNum: number) {
  let sessionIndex = 0;
  let pageNum = startPageNum;
  
  doc.addPage();
  drawBackground(doc);
  drawPageHeader(doc, title);
  let yPos = 90;
  
  while (sessionIndex < sessions.length) {
    const session = sessions[sessionIndex];
    
    // Calculate heights dynamically to avoid any text overlapping
    doc.font('Helvetica-Bold').fontSize(9.5);
    const titleHeight = doc.heightOfString(session.title, { width: 260 });
    
    const speakerNames = (session.speakers || []).map((s: Speaker) => s.name).join(', ');
    doc.font('Helvetica-Oblique').fontSize(8);
    const speakersHeight = speakerNames ? doc.heightOfString(`Speakers: ${speakerNames}`, { width: 260 }) : 0;
    
    const padding = 12;
    const gap = 4;
    const cardHeight = padding * 2 + titleHeight + (speakersHeight ? gap + speakersHeight : 0);
    
    // Paginate if the card overflows the printable bottom page boundary
    if (yPos + cardHeight > 780) {
      drawPageFooter(doc, pageNum);
      pageNum++;
      
      doc.addPage();
      drawBackground(doc);
      drawPageHeader(doc, title);
      yPos = 90;
    }
    
    // Draw row container (rounded corners)
    doc.roundedRect(40, yPos, 515, cardHeight, 6).fill(COLORS.panel);
    doc.roundedRect(40, yPos, 515, cardHeight, 6).lineWidth(1).stroke(COLORS.border);
    
    // Type indicator line
    let indicatorColor = COLORS.gold;
    const type = session.category || 'general';
    if (type === 'panel') indicatorColor = COLORS.emerald;
    else if (type === 'keynote') indicatorColor = COLORS.goldLight;
    else if (type === 'networking') indicatorColor = COLORS.muted;
    else if (type === 'break') indicatorColor = COLORS.border;
    doc.rect(40, yPos, 3, cardHeight).fill(indicatorColor);

    // Time Column (Centered vertically inside card)
    doc.fillColor(COLORS.goldLight)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(`${session.start_time} - ${session.end_time}`, 52, yPos + (cardHeight - 10) / 2);

    // Title
    doc.fillColor(COLORS.text)
       .font('Helvetica-Bold')
       .fontSize(9.5)
       .text(session.title, 160, yPos + padding, { width: 260 });
    
    // Speakers (Drawn dynamically below the title, with perfect gap offset)
    if (speakerNames) {
      doc.fillColor(COLORS.muted)
         .font('Helvetica-Oblique')
         .fontSize(8)
         .text(`Speakers: ${speakerNames}`, 160, yPos + padding + titleHeight + gap, { width: 260 });
    }

    // Category
    doc.fillColor(COLORS.white)
       .font('Helvetica-Bold')
       .fontSize(7.5)
       .text(type.toUpperCase(), 430, yPos + padding, { width: 110, align: 'right' });

    // Location (Room)
    doc.fillColor(COLORS.muted)
       .font('Helvetica')
       .fontSize(8)
       .text(session.location || 'Main Auditorium', 430, yPos + padding + 15, { width: 110, align: 'right' });

    yPos += cardHeight + 8;
    sessionIndex++;
  }
  
  drawPageFooter(doc, pageNum);
  pageNum++;
  
  return pageNum;
}

const day1Sessions = MOCK_EVENTS.find(e => e.id === 'nbac-2027-day-1')?.sessions || [];
const day2Sessions = MOCK_EVENTS.find(e => e.id === 'nbac-2027-day-2')?.sessions || [];

// Draw Agendas and track page numbers dynamically
pageNumber = drawAgenda(doc, "Program Agenda — Day 1", day1Sessions, pageNumber);
pageNumber = drawAgenda(doc, "Program Agenda — Day 2", day2Sessions, pageNumber);

doc.end();

writeStream.on('finish', () => {
  console.log('NBAC 2027 Brochure PDF generated successfully!');
});
writeStream.on('error', (err) => {
  console.error('Error writing PDF brochure:', err);
});
