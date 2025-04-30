async function activateModule(moduleName) {
  try {
    const response = await fetch(`../modules/${moduleName}.json`);
    const module = await response.json();

    const info = `
✅ מודול נטען בהצלחה!
- שם: ${module.name}
- גרסה: ${module.version}
- תיאור: ${module.description}
- פיצ'רים: ${module.features.join(', ')}
    `;

    alert(info);
  } catch (error) {
    alert(`❌ שגיאה בטעינת מודול ${moduleName}: ${error.message}`);
  }
}
