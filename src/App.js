import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import AppTitle from './AppTitle';
import { PrivacyMode, EditMode } from './createContexts';
import { ExamTable, ExamForm } from './ExamComponents'
import API from './API';

function App() {

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [privacy, setPrivacy] = useState(false);
  const [editable, setEditable] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [loading, setLoading] = useState(true);

  // Carica i COURSES
  useEffect( () => {
    const getCourses = async () => {
      const courses = await API.getAllCourses();
      setCourses(courses);
    }
    getCourses();
  }, []);

  // Carica gli EXAMS
  useEffect( () => {
    const getExams = async () => {
      const exams = await API.getAllExams();
      setExams(exams);
      //setDirty(false); // ANCHE QUI VA BENE
    }
    if (courses.length && dirty)
      getExams().then( () => { setLoading(false); setDirty(false) });
  }, [courses.length, dirty]);
  
  const examCodes = exams.map(exam => exam.coursecode);

  const addExam = (exam) => {
    exam.status = 'added';
    setExams((oldExams) => [...oldExams, exam]);
    API.addExam(exam).then( () => { setDirty(true) });
  };

  const deleteExam = (coursecode) => {
    //setExams((exs) => exs.filter((ex) => ex.coursecode !== coursecode));
    setExams( oldExams => {
      return oldExams.map( ex => {
        if (ex.coursecode === coursecode)
          return {...ex, status: 'deleted'};
        else
          return ex;
      })
    })
    API.deleteExam(coursecode).then( () => { setDirty(true) })
  };

  const updateExam = (exam) => {
    setExams(oldExams => {
      return oldExams.map(ex => {
        if (ex.coursecode === exam.coursecode)
          return { coursecode: exam.coursecode, score: exam.score, date: exam.date, status: 'updated' };
        else
          return ex;
      });
    });
    API.updateExam(exam).then( () => { setDirty(true) });

  }

  /* Controlla che esame non sia già presente
  const checkExam = (course) => {
    if (exams.filter( ex => ex.coursecode === course).length === 0)
        return true;
    else
        return false;
};
*/

return (
  <Router>
    <Container className='App'>
      <Switch>
        <Route path="/add" render={() => <>
          <Row>
            <AppTitle />
          </Row>
          <ExamForm courses={courses.filter(course => !examCodes.includes(course.coursecode))}
            addOrUpdateExam={addExam} /> </>} />
        <Route path="/update" render={() => <>
          <Row>
            <AppTitle />
          </Row>
          <ExamForm courses={courses}
            addOrUpdateExam={updateExam} /> </>} />
        <Route path='/' render={() =>
          <>
            <Row>
              <AppTitle />
              <Col align='right'>
                <Button variant='secondary' onClick={() => setPrivacy(p => !p)}>{privacy ? 'View' : 'Hide'}</Button>
                <Button variant='secondary' onClick={() => setEditable(e => !e)}>{editable ? 'Read' : 'Edit'}</Button>
              </Col>
            </Row>

            { loading ? <span> 🕗 Please wait, loading your exams... 🕗 </span> : 
            <Row>
              <Col>
                <PrivacyMode.Provider value={privacy}>
                  <EditMode.Provider value={editable}>
                    <ExamTable exams={exams} courses={courses} deleteExam={deleteExam} />
                  </EditMode.Provider>
                </PrivacyMode.Provider>
              </Col>
            </Row>}
          </>
        } />
      </Switch>
    </Container>
  </Router>
);
}

export default App;