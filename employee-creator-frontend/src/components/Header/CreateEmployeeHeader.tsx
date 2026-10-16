import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import classes from "./CreateEmployeeHeader.module.scss";

interface CreateEmployeeHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function CreateEmployeeHeader({
  title,
  onBack,
}: CreateEmployeeHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header className={classes.header}>
      <div className={classes.headerContent}>
        <div className={classes.row}>
          <Button
            variant="onDark"
            className={classes.backBtn}
            onClick={handleBack}
          >
            Back
          </Button>
          <h1 className={classes.title}>{title}</h1>
        </div>
      </div>
    </header>
  );
}
