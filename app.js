const express = require('express');
const mongoose = require('mongoose');


app = express();
const port = 3000;

mongoose
  .connect('mongodb://127.0.0.1/mongo-test')
  .then(() =>
    console.log({
      message:'Connected to Database...',
    })
  )
  .catch((err) => console.error('Connection failed', err));

const courseModel = require('./courseSchema'); 

// async function getCourses() {
//   const courses = await courseModel.find({  }).sort({description:1});
//   console.log(courses);
// }

// getCourses();
// async function courseData() {
//   try {
//     // Fetch data from MongoDB
//     const courses = await courseModel.find({}).lean();

//     // Iterate over each document
//     courses.forEach(courses => {
//       console.log(`Course ID: ${courses._id}`);

//       // Iterate over each field in the document
//       Object.entries(courses).forEach(([fieldName, fieldValue]) => {
//         console.log(`${fieldName}:`);

//         // Check if the field value is an array and sort it based on a property
//         if (Array.isArray(fieldValue) && fieldValue.length > 0 && typeof fieldValue[0] === 'object') {
//           const sortedArray = fieldValue.sort((a, b) => (a.description > b.description ? 1 : -1));
//           sortedArray.forEach((sortedItem, index) => {
//             console.log(`  ${index + 1}. ${JSON.stringify(sortedItem)}`);
//           });
//         } else {
//           console.log(`  ${JSON.stringify(fieldValue)}`);
//         }
//       });

//       console.log(); // Add a newline for better readability
//     });

//   } catch (error) {
//     console.error(error);
//     // Handle errors appropriately
//   }
// }

// courseData();

app.get('/courses', async (req, res) => {
  try {
    const courses = await courseModel.find({}).lean();

    // Sort the courses based on the 'description' property
    courses.forEach(course => {
      Object.entries(course).forEach(([fieldName, fieldValue]) => {
        if (Array.isArray(fieldValue) && fieldValue.length > 0 && typeof fieldValue[0] === 'object') {
          course[fieldName] = fieldValue.sort((a, b) => (a.description > b.description? 1 : -1));
        }
      });
    });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/courses/extract', async (req, res) => {
  try {
    // Fetch data from MongoDB
    const courses = await courseModel.find({}).lean();

    // Extract and transform data for response
    const transformedCourses = courses.map(course => {
      const transformedYears = Object.entries(course).map(([year, coursesArray]) => {
        if (Array.isArray(coursesArray)) {
          const transformedCoursesArray = coursesArray.map(courseItem => ({
            code: courseItem.code || '',
            description: courseItem.description || '',
          }));
          return { [year]: transformedCoursesArray };
        } else {
          return null; // Ignore non-array fields (e.g., _id)
        }
      }).filter(Boolean); // Remove null entries

      return Object.assign({}, ...transformedYears);
    });

    // Send the response as JSON
    res.json(transformedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/courses/publish', async (req, res) => {
  try {
    // Fetch all courses from MongoDB
    const allCourses = await courseModel.find({}).lean();

    // Filter courses for both BSIS and BSIT
    const filteredCourses = allCourses.filter(course => {
      return (
        course['1st Year'].some(item => item.tags.includes('BSIS')) ||
        course['2nd Year'].some(item => item.tags.includes('BSIS')) ||
        course['3rd Year'].some(item => item.tags.includes('BSIS')) ||
        course['4th Year'].some(item => item.tags.includes('BSIS')) ||
        course['1st Year'].some(item => item.tags.includes('BSIT')) ||
        course['2nd Year'].some(item => item.tags.includes('BSIT')) ||
        course['3rd Year'].some(item => item.tags.includes('BSIT')) ||
        course['4th Year'].some(item => item.tags.includes('BSIT'))
      );
    });

    // Send the response as JSON
    res.json(filteredCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



  


  // const coursesSchema = new mongoose.Schema({
  //   name: String,
  //   // other fields as needed
  // });
  
  // // Create a mongoose model based on the schema
  // const courses = mongoose.model('courses', coursesSchema);
  
  // Route to retrieve and sort data
  // app.get('/api/courses', async (req, res) => {
  //   try {
  //     // Retrieve all published data and sort by name alphabetically
  //     const result = await courses.find().sort({ name: 1 });
  
  //     res.json(result);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send('Internal Server Error');
  //   }
  // });



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

