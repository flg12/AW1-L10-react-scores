import dayjs from 'dayjs';

const BASEURL = '/api';

async function getAllExams() {
  const response = await fetch(BASEURL + '/exams');
  const examsJson = await response.json();
  if (response.ok) {
    return examsJson.map(e => ({ coursecode: e.code, score: e.score, date: dayjs(e.date) }));
  } else {
    throw examsJson;  // an object with the error coming from the server
  }
};

async function getAllCourses() {
  const response = await fetch(BASEURL + '/courses');
  const coursesJson = await response.json();
  if (response.ok)
    return coursesJson.map(c => ({ coursecode: c.code, name: c.name, CFU: c.CFU }));
  else
    throw coursesJson;

};

// ADD EXAM CON THEN
function addExam(exam) {
  return new Promise((resolve, reject) => {
    fetch(BASEURL + '/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: exam.coursecode, score: exam.score, date: dayjs(exam.date).format('YYYY-MM-DD') })
    })
      .then(response => {
        if (response.ok)
          resolve(null);
        else {
          response.json().then(message => { reject(message) }).catch(() => { reject({ error: "Cannot parse server response." }) })
            .catch(() => { reject({ error: "Cannot communicate with the server." }) });
        }
      })
  })
}

// ADD EXAM CON AWAIT

//--------------------------------------

function deleteExam(coursecode) {
  return new Promise((resolve, reject) => {
    fetch(BASEURL + '/exams/' + coursecode, {
      method: 'DELETE',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function updateExam(exam) {
  // call: PUT /api/exams/:coursecode
  return new Promise((resolve, reject) => {
    fetch(BASEURL + '/exams', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({code: exam.coursecode, score: exam.score, date: dayjs(exam.date).format('YYYY-MM-DD')}),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

//const API = {logIn, logOut, getUserInfo};
const API = { getAllCourses, getAllExams, addExam, deleteExam, updateExam };
export default API;