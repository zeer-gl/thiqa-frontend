import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from "@mui/material/Avatar";
import '../css/components/project-card.scss';

const ProjectCard = ({ project }) => {
    const { t } = useTranslation();

    // Default project data if no props are passed
    const defaultProject = {
        id: 1,
        title: t('pages.service-detail.project-title'),
        image: '/src/assets/payment/project-image.svg',
        categories: [t('pages.service-detail.full-construction')],
        rating: 4.8,
        date: '12.08.2025'
    };

    // If project prop is provided, use it; otherwise use default
    const projectData = project || defaultProject;

    // Format date from API or use default
    const formatDate = (dateString) => {
        if (!dateString) return projectData.date;
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return projectData.date;
        }
    };

    // Get project image from API or use default
    const getProjectImage = () => {
        if (project && project.images && project.images.length > 0) {
            return project.images[0];
        }
        return projectData.image;
    };

    // Get project title from API or use default
    const getProjectTitle = () => {
        if (project && project.description) {
            return project.description;
        }
        return projectData.title;
    };

    // Get project categories from API or use default
    const getProjectCategories = () => {
        if (project && project.projecttype) {
            return [project.projecttype];
        }
        return projectData.categories;
    };

    // Get project area and location from API
    const getProjectDetails = () => {
        if (project) {
            const details = [];
            if (project.area) details.push(`Area: ${project.area}`);
            if (project.location) details.push(`Location: ${project.location}`);
            return details;
        }
        return [];
    };

    return (
        <div className="project-card">
            <div className="project-image">
                {getProjectImage() ? (
                    <img 
                        src={getProjectImage()} 
                        alt={getProjectTitle()}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                {/* Avatar fallback when no image or image fails to load */}
                <Avatar
                    alt={getProjectTitle()}
                    className="project-avatar-fallback"
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: getProjectImage() ? 'none' : 'flex',
                        borderRadius: "0 !important",
                        fontSize: "2rem",
                        backgroundColor: "#f0f0f0",
                        color: "#666"
                    }}
                >
                    {getProjectTitle()?.[0]?.toUpperCase() || "P"}
                </Avatar>
            </div>
            <div className="project-date my-2">{formatDate(project?.date)}</div>
            <div className="project-info">
                <div className="project-title">{getProjectTitle()}</div>
                <div className="project-categories">
                    {getProjectCategories().map((category, index) => (
                        <span key={index} className="category-tag">
                            {category}
                        </span>
                    ))}
                </div>
                {/* Show project details if available from API */}
                {getProjectDetails().length > 0 && (
                    <div className="project-details mb-2">
                        {getProjectDetails().map((detail, index) => (
                            <span key={index} className="detail-tag">
                                {detail}
                            </span>
                        ))}
                    </div>
                )}
                {/* Star rating section removed */}
                <div className="project-button">
                    {/* <button className="btn-project-detail">
                        {t('pages.service-detail.view-project')}
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard; 