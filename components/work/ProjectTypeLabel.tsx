import {
  getProjectTypeLabel,
  type ProjectType,
} from "@/data/projects";
import styles from "./ProjectTypeLabel.module.css";

type ProjectTypeLabelProps = {
  className?: string;
  projectType: ProjectType;
};

const ProjectTypeLabel = ({ className, projectType }: ProjectTypeLabelProps) => {
  const label = getProjectTypeLabel(projectType);

  return label ? (
    <span
      className={`${styles.label}${className ? ` ${className}` : ""}`}
      data-project-type={projectType}
    >
      {label}
    </span>
  ) : null;
};

export default ProjectTypeLabel;
