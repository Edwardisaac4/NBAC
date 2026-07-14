import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  margins: { top: 40, bottom: 40, left: 40, right: 40 }
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

// Data Source
const SPEAKERS = [
  {
    name: "Segun Demuren",
    title: "Chairman",
    company: "NBAC Steering Committee",
    bio: "Segun Demuren is a prominent leader in African business aviation, with decades of experience driving transport logistics, investments, and aviation development across West Africa."
  },
  {
    name: "Steve Varsano",
    title: "Founder",
    company: "The Jet Business",
    bio: "Steve Varsano is the founder of the world's first street-level corporate aviation showroom, and is a globally renowned jet broker with over 40 years of transaction experience."
  },
  {
    name: "Chidinma Okafor",
    title: "Head of Regulatory Compliance",
    company: "Nigerian Civil Aviation Authority (NCAA)",
    bio: "Ms. Chidinma Okafor is an aviation law expert specializing in regulatory compliance, safety oversight audit processes, and airspace management policies."
  },
  {
    name: "Capt. Fatima Ali",
    title: "Director of Flight Operations",
    company: "Zenith Jet Services",
    bio: "Capt. Fatima Ali is a pioneer in corporate aviation piloting with over 8,000 flight hours command experience on Gulfstream and Bombardier aircraft."
  },
  {
    name: "Dr. Adebayo Ojo",
    title: "Senior Aviation Economist & Advisor",
    company: "Lagos Business School",
    bio: "Dr. Adebayo Ojo conducts policy research on transport economics and infrastructure financing, consulting for governments and private airport consortia."
  },
  {
    name: "Dr. Amina Olaye",
    title: "Executive Director",
    company: "AeroGreen Technologies",
    bio: "Dr. Amina Olaye is an aerospace engineer and environmental advocate leading research into sustainable aviation fuels (SAF) and green propulsion systems."
  },
  {
    name: "Erica",
    title: "Aviation Finance Lead",
    company: "TLG Capital",
    bio: "Erica is a leading finance specialist specializing in real-world aircraft leasing, structure financing, and aviation asset management in emerging markets."
  },
  {
    name: "Capt. Ibrahim Nuru",
    title: "Chief Pilot",
    company: "Air Nigeria Charter",
    bio: "Capt. Ibrahim Nuru commands charter operations across the Middle East and African corridors, advising operators on procedural safety and FBO logistics."
  }
];

const AGENDA_DAY1 = [
  { time: "08:00 - 10:00", title: "Registration and Refreshments", type: "Networking", room: "Grand Ballroom Foyer" },
  { time: "10:00 - 10:30", title: "Opening Remarks & Welcome Address", type: "Keynote", room: "Main Auditorium" },
  { time: "10:30 - 10:45", title: "Chairman Keynote Speech", type: "Keynote", speaker: "Segun Demuren", room: "Main Auditorium" },
  { time: "10:45 - 10:55", title: "Ministerial Guest of Honor Slot", type: "Keynote", speaker: "Minister of Aviation", room: "Main Auditorium" },
  { time: "11:00 - 11:30", title: "Networking Break & Ice Breaker", type: "Networking", room: "Exhibition Hall" },
  { time: "11:30 - 12:30", title: "One Sky, Many Voices: Industry Dialogue", type: "Panel", room: "Main Auditorium" },
  { time: "12:30 - 13:30", title: "Rules that Fly: Regulatory Roundtable", type: "Panel", room: "Main Auditorium" },
  { time: "13:30 - 14:30", title: "The Boardroom at 40,000 ft: Ecosystem Growth", type: "Keynote", speaker: "Steve Varsano", room: "Main Auditorium" },
  { time: "14:30 - 15:00", title: "Lunch & Networking", type: "Break", room: "Dining Suite" },
  { time: "15:00 - 16:00", title: "Deals That Got Done: Finance Structures", type: "Panel", room: "Main Auditorium" },
  { time: "16:00 - 17:00", title: "AeroLab Pitch: Finalist Innovations", type: "Workshop", room: "AeroLab Arena" },
  { time: "19:30 - 22:00", title: "NBAC Gala Dinner & Awards Ceremony", type: "Networking", room: "Grand Ballroom" }
];

const AGENDA_DAY2 = [
  { time: "09:00 - 09:30", title: "Welcome & Day 1 Recap", type: "Keynote", room: "Main Auditorium" },
  { time: "09:30 - 10:30", title: "From Niche to Necessary: Ecosystem Scaling", type: "Panel", room: "Main Auditorium" },
  { time: "10:30 - 11:30", title: "Sustainability: SAF & Green Tech Integration", type: "Panel", room: "Main Auditorium" },
  { time: "11:40 - 12:40", title: "She Commands the Sky: Women in Aviation", type: "Panel", room: "Main Auditorium" },
  { time: "12:40 - 13:10", title: "Morning Networking Break", type: "Networking", room: "Exhibition Hall" },
  { time: "13:10 - 14:10", title: "Flying Into the Future: AI & eVTOL Tech", type: "Panel", room: "Main Auditorium" },
  { time: "14:10 - 15:10", title: "AeroLab Winners Ceremony", type: "Workshop", room: "Main Auditorium" },
  { time: "15:30 - 17:00", title: "Speed Networking & Farewell Cocktail", type: "Networking", room: "Sky Lounge & Poolside" }
];

// Draw Background helper
function drawBackground(doc) {
  doc.rect(0, 0, 595.28, 841.89).fill(COLORS.canvas);
  // Elegant gold geometric border line on left edge
  doc.rect(0, 0, 4, 841.89).fill(COLORS.gold);
}

// Draw Header helper
function drawPageHeader(doc, pageTitle) {
  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('NIGERIAN BUSINESS AVIATION CONFERENCE 2027', 40, 25, { characterSpacing: 1.5 });
  
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(22)
     .text(pageTitle.toUpperCase(), 40, 40);
  
  // Decorative line
  doc.moveTo(40, 70)
     .lineTo(555, 70)
     .strokeColor(COLORS.border)
     .lineWidth(1)
     .stroke();
}

// Draw Footer helper
function drawPageFooter(doc, pageNum) {
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

// Custom luxury geometric patterns
doc.lineWidth(1.5);
doc.strokeColor(COLORS.gold)
   .moveTo(100, 150)
   .lineTo(500, 150)
   .lineTo(400, 300)
   .lineTo(100, 150)
   .stroke();

doc.strokeColor(COLORS.emerald)
   .moveTo(450, 180)
   .lineTo(200, 380)
   .lineTo(480, 380)
   .lineTo(450, 180)
   .stroke();

// Branding texts
doc.fillColor(COLORS.gold)
   .font('Helvetica-Bold')
   .fontSize(14)
   .text('THE 2ND ANNUAL', 40, 450, { characterSpacing: 2 });

doc.fillColor(COLORS.white)
   .font('Helvetica-Bold')
   .fontSize(34)
   .text('NIGERIAN BUSINESS', 40, 475)
   .text('AVIATION CONFERENCE', 40, 515);

doc.fillColor(COLORS.goldLight)
   .font('Helvetica-Bold')
   .fontSize(38)
   .text('NBAC 2027', 40, 560);

// Divider
doc.moveTo(40, 615)
   .lineTo(300, 615)
   .strokeColor(COLORS.gold)
   .lineWidth(2)
   .stroke();

// Tagline
doc.fillColor(COLORS.text)
   .font('Helvetica-Oblique')
   .fontSize(13)
   .text('Fly to the Future: Innovation, Sustainability & Leadership', 40, 635);

// Details
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

// Event statistics box (Glassmorphic imitation)
doc.rect(40, 480, 515, 120).fill(COLORS.panel);
doc.rect(40, 480, 515, 120).lineWidth(1).stroke(COLORS.border);

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

// Stat 3
doc.fillColor(COLORS.gold)
   .font('Helvetica-Bold')
   .fontSize(28)
   .text('15+', 420, 510);
doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('Expert Speakers', 420, 545);

drawPageFooter(doc, 2);

// ==========================================
// PAGE 3: FEATURED SPEAKERS (PART 1)
// ==========================================
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Featured Speakers");

let yPos = 90;
const speakersPerPage = 4;

for (let i = 0; i < speakersPerPage; i++) {
  const spk = SPEAKERS[i];
  
  // Outer border box
  doc.rect(40, yPos, 515, 150).fill(COLORS.panel);
  doc.rect(40, yPos, 515, 150).lineWidth(1).stroke(COLORS.border);
  
  // Decorative small gold line
  doc.rect(40, yPos, 3, 150).fill(COLORS.gold);

  // Speaker Details
  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(13)
     .text(spk.name, 60, yPos + 15);
  
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(`${spk.title} — ${spk.company}`, 60, yPos + 32);

  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(9.5)
     .text(spk.bio, 60, yPos + 55, { width: 475, align: 'justify', lineGap: 3 });

  yPos += 165;
}

drawPageFooter(doc, 3);

// ==========================================
// PAGE 4: FEATURED SPEAKERS (PART 2)
// ==========================================
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Featured Speakers");

yPos = 90;
for (let i = speakersPerPage; i < SPEAKERS.length; i++) {
  const spk = SPEAKERS[i];
  
  // Outer border box
  doc.rect(40, yPos, 515, 150).fill(COLORS.panel);
  doc.rect(40, yPos, 515, 150).lineWidth(1).stroke(COLORS.border);
  
  // Decorative small gold line
  doc.rect(40, yPos, 3, 150).fill(COLORS.gold);

  // Speaker Details
  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(13)
     .text(spk.name, 60, yPos + 15);
  
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(`${spk.title} — ${spk.company}`, 60, yPos + 32);

  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(9.5)
     .text(spk.bio, 60, yPos + 55, { width: 475, align: 'justify', lineGap: 3 });

  yPos += 165;
}

drawPageFooter(doc, 4);

// ==========================================
// PAGE 5: AGENDA DAY 1
// ==========================================
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Program Agenda — Day 1");

yPos = 95;
AGENDA_DAY1.forEach((session) => {
  // Row container background
  doc.rect(40, yPos, 515, 52).fill(COLORS.panel);
  doc.rect(40, yPos, 515, 52).lineWidth(1).stroke(COLORS.border);
  
  // Type indicator line
  let indicatorColor = COLORS.gold;
  if (session.type === 'Panel') indicatorColor = COLORS.emerald;
  if (session.type === 'Keynote') indicatorColor = COLORS.goldLight;
  if (session.type === 'Networking') indicatorColor = COLORS.muted;
  doc.rect(40, yPos, 3, 52).fill(indicatorColor);

  // Time Column
  doc.fillColor(COLORS.goldLight)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(session.time, 52, yPos + 21);

  // Title & Speakers
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(session.title, 160, yPos + 12, { width: 260 });
  
  if (session.speaker) {
    doc.fillColor(COLORS.muted)
       .font('Helvetica-Oblique')
       .fontSize(8.5)
       .text(`Speaker: ${session.speaker}`, 160, yPos + 27);
  }

  // Session Room & Category
  doc.fillColor(COLORS.white)
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text(session.type.toUpperCase(), 430, yPos + 12, { width: 110, align: 'right' });

  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(8.5)
     .text(session.room, 430, yPos + 27, { width: 110, align: 'right' });

  yPos += 57;
});

drawPageFooter(doc, 5);

// ==========================================
// PAGE 6: AGENDA DAY 2
// ==========================================
doc.addPage();
drawBackground(doc);
drawPageHeader(doc, "Program Agenda — Day 2");

yPos = 95;
AGENDA_DAY2.forEach((session) => {
  // Row container background
  doc.rect(40, yPos, 515, 52).fill(COLORS.panel);
  doc.rect(40, yPos, 515, 52).lineWidth(1).stroke(COLORS.border);
  
  // Type indicator line
  let indicatorColor = COLORS.gold;
  if (session.type === 'Panel') indicatorColor = COLORS.emerald;
  if (session.type === 'Keynote') indicatorColor = COLORS.goldLight;
  if (session.type === 'Networking') indicatorColor = COLORS.muted;
  doc.rect(40, yPos, 3, 52).fill(indicatorColor);

  // Time Column
  doc.fillColor(COLORS.goldLight)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(session.time, 52, yPos + 21);

  // Title & Speakers
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(session.title, 160, yPos + 12, { width: 260 });
  
  if (session.speaker) {
    doc.fillColor(COLORS.muted)
       .font('Helvetica-Oblique')
       .fontSize(8.5)
       .text(`Speaker: ${session.speaker}`, 160, yPos + 27);
  }

  // Session Room & Category
  doc.fillColor(COLORS.white)
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text(session.type.toUpperCase(), 430, yPos + 12, { width: 110, align: 'right' });

  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(8.5)
     .text(session.room, 430, yPos + 27, { width: 110, align: 'right' });

  yPos += 57;
});

drawPageFooter(doc, 6);

doc.end();

writeStream.on('finish', () => {
  console.log('NBAC 2027 Brochure PDF generated successfully!');
});
writeStream.on('error', (err) => {
  console.error('Error writing PDF brochure:', err);
});
