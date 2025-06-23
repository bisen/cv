const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// --- Main Build Function ---
async function buildCV() {
  try {
    console.log('Starting CV build process...');

    // 1. Read the JSON data file
    const jsonString = fs.readFileSync(path.join(__dirname, 'cv-data.json'), 'utf8');

    // 2. Read the Handlebars template file
    const templateSource = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

    // 3. Parse JSON to a JavaScript object
    const rawJsonData = JSON.parse(jsonString);
    console.log('Successfully parsed JSON data.');

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
// This function transforms the JSON data to make it easier to use in Handlebars
function transformData(rawJson) {
  return {
    name: rawJson.name || '',
    title: rawJson.title || '',
    summary: rawJson.summary || '',
    contact: {
      email: rawJson.contact?.email || '',
      phone: rawJson.contact?.phone || '',
      linkedin: rawJson.contact?.linkedin || '',
      website: rawJson.contact?.website || '',
      location: rawJson.contact?.location || ''
    },
    experience: rawJson.experience?.map(job => ({
      position: job.position || '',
      company: job.company || '',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      duration: `${job.startDate} - ${job.endDate}`,
      location: job.location || '',
      responsibilities: job.responsibilities || [],
      teams: job.teams || null
    })) || [],
    education: rawJson.education?.map(edu => ({
      degree: edu.degree || '',
      institution: edu.institution || '',
      location: edu.location || '',
      graduationYear: edu.graduationYear || ''
    })) || [],
    skills: rawJson.skills?.map(skill => ({
      category: skill.category || '',
      items: skill.items || ''
    })) || [],
    languages: rawJson.languages?.map(lang => ({
      name: lang.name || '',
      proficiency: lang.proficiency || ''
    })) || [],
    personal_projects: rawJson.personal_projects?.map(project => ({
      projectName: project.projectName || '',
      description: project.description || '',
      technologies: project.technologies || [],
      url: project.url || ''
    })) || []
  };
}

// Run the build process
buildCV();
