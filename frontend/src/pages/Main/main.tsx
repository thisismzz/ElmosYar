import PlannerPreview from '../../components/Main/PlannerPreview';
import NotesPreview from '../../components/Main/NotesPreview';
import './main.css';

export const Main = () => {
  return (
    <div className="main-page">
      <div className="main-container">
        <PlannerPreview />
        <NotesPreview />
      </div>
    </div>
  );
};