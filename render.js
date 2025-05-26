const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { XMLParser } = require('fast-xml-parser');

// --- Main Build Function ---
async function buildCV() {
  try {
    console.log('Starting CV build process...');

    // 1. Read the XML data file
    const xmlString = fs.readFileSync(path.join(__dirname, 'cv-data.xml'), 'utf8');

    // 2. Read the Handlebars template file
    const templateSource = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

    // 3. Parse XML to a JavaScript object
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@",
      textNodeName: "#text",
      parseAttributeValue: true,
      allowBooleanAttributes: true
    });
    const rawJsonData = parser.parse(xmlString).resume;
    console.log('Successfully parsed XML data.');

    // 4. Transform the raw JSON into the structure our template expects
    const resumeData = transformData(rawJsonData);
    console.log('Transformed data for Handlebars.');

    // 5. Compile the Handlebars template
    const template = Handlebars.compile(templateSource);

    // 6. Render the final HTML
    const finalHtml = template({ resume: resumeData });
    console.log('Rendered final HTML.');

    // 7. Write the final HTML to a file in a 'dist' directory
    if (!fs.existsSync(path.join(__dirname, 'dist'))) {
      fs.mkdirSync(path.join(__dirname, 'dist'));
    }
    fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), finalHtml);

    console.log('\n✅ Success! Your CV has been built to dist/index.html');

  } catch (error) {
    console.error('\n❌ Build failed:', error);
    process.exit(1); // Exit with an error code
  }
}

// --- Data Transformation Helper ---
// This function cleans up the parsed XML to make it easier to use in Handlebars
function transformData(rawJson) {
  return {
    name: rawJson.name || '',
    title: rawJson.title || '',
    contact: {
      email: rawJson.contact?.email || '',
      phone: rawJson.contact?.phone || '',
      linkedin: {
        url: rawJson.contact?.linkedin?.url || '',
        text: rawJson.contact?.linkedin?.text || ''
      },
      location: rawJson.contact?.location || ''
    },
    experience: (Array.isArray(rawJson.experience?.job) ? rawJson.experience.job : [rawJson.experience.job]).map(job => ({
      jobTitle: job.jobTitle || '',
      company: job.company || '',
      duration: job.duration || '',
      location: job.location || '',
      responsibilities: Array.isArray(job.responsibilities?.responsibility) ? job.responsibilities.responsibility : [job.responsibilities.responsibility]
    })),
    education: (Array.isArray(rawJson.education?.school) ? rawJson.education.school : [rawJson.education.school]).map(edu => ({
      degree: edu.degree || '',
      university: edu.university || '',
      graduationDate: edu.graduationDate || ''
    })),
    skills: (Array.isArray(rawJson.skills?.category) ? rawJson.skills.category : [rawJson.skills.category]).map(skillCat => ({
      category: skillCat['@name'] || '',
      items: skillCat['#text'] || ''
    })),
    languages: (Array.isArray(rawJson.languages?.language) ? rawJson.languages.language : [rawJson.languages.language]).map(lang => ({
      name: lang.name || '',
      proficiency: lang.proficiency || ''
    })),
    publications: (Array.isArray(rawJson.publications?.publication) ? rawJson.publications.publication : [rawJson.publications.publication]).map(pub => ({
      title: pub.title || '',
      journal: pub.journal || '',
      authors: pub.authors || '',
      year: pub.year || '',
      url: pub.url || ''
    }))
  };
}

// Run the build process
buildCV();
