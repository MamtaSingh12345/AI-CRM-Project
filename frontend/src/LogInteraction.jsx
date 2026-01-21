// LogInteraction.jsx (Redux Version)
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Badge,
  InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LogInteraction.css';

// Import Redux actions and selectors
import {
  setChatNotes,
  setFormData,
  resetFormData,
  clearChat,
  clearChatHistory,
  clearError,
  clearAllErrors,
  clearAiResponses,
  submitChat,
  submitForm,
  selectChatNotes,
  selectFormData,
  selectIsSubmitting,
  selectChatAiResponse,
  selectFormAiResponse,
  selectChatHistory,
  selectErrors,
  selectSubmitStatus,
  selectFormValidation,
  selectChatValidation,
} from './interactionSlice';

const LogInteraction = () => {
  // Redux hooks
  const dispatch = useDispatch();
  
  // Select data from Redux store
  const chatNotes = useSelector(selectChatNotes);
  const formData = useSelector(selectFormData);
  const isSubmitting = useSelector(selectIsSubmitting);
  const chatAiResponse = useSelector(selectChatAiResponse);
  const formAiResponse = useSelector(selectFormAiResponse);
  const chatHistory = useSelector(selectChatHistory);
  const errors = useSelector(selectErrors);
  const submitStatus = useSelector(selectSubmitStatus);
  
  // Derived validation errors
  const formValidationErrors = useSelector(selectFormValidation);
  const chatValidationErrors = useSelector(selectChatValidation);
  
  // Handle chat input changes
  const handleChatChange = (e) => {
    dispatch(setChatNotes(e.target.value));
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormData({ name, value }));
  };

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    // Validate chat
    if (chatValidationErrors.chatNotes) {
      dispatch(clearError('chatSubmit'));
      return;
    }

    // Submit chat via Redux async thunk
    dispatch(submitChat(chatNotes));
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const hasFormErrors = Object.keys(formValidationErrors).length > 0;
    if (hasFormErrors) {
      // Set validation errors in state
      Object.keys(formValidationErrors).forEach(field => {
        if (formValidationErrors[field]) {
          // You might want to dispatch setError for each field
          // For now, we'll just prevent submission
        }
      });
      dispatch(clearError('formSubmit'));
      return;
    }

    // Submit form via Redux async thunk
    dispatch(submitForm(formData));
  };

  // Clear chat input
  const handleClearChat = () => {
    dispatch(clearChat());
  };

  // Reset form
  const handleResetForm = () => {
    dispatch(resetFormData());
  };

  // Clear all errors
  const handleClearErrors = () => {
    dispatch(clearAllErrors());
  };

  // Clear AI responses
  const handleClearAI = () => {
    dispatch(clearAiResponses());
  };

  // Interaction types for dropdown
  const interactionTypes = [
    'consultation',
    'follow-up',
    'emergency',
    'telemedicine',
    'surgery',
    'therapy'
  ];

  // Effect to clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAllErrors());
    };
  }, [dispatch]);

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              <i className="fas fa-stethoscope me-2"></i>
              AI Healthcare CRM 
            </h1>
            <p className="header-subtitle">Professional Patient Interaction Management System</p>
          </div>
          <div className="header-status">
            <Badge bg="success" className="status-badge">
              <i className="fas fa-check-circle me-1"></i>
              Backend Connected
            </Badge>
            <div className="header-stats">
              <span className="stat-item">
                <i className="fas fa-users me-1"></i>
                <strong>Today:</strong> 8 Patients
              </span>
              <span className="stat-item">
                <i className="fas fa-file-medical me-1"></i>
                <strong>Interactions:</strong> {chatHistory.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <Container fluid className="dashboard-body">
        <Row className="g-4">
          {/* LEFT COLUMN - Chat Interface (40%) */}
          <Col lg={5} xl={4} className="chat-column">
            <Card className="dashboard-card chat-card">
              <Card.Header className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="card-title mb-0">
                      <i className="fas fa-comment-dots me-2"></i>
                      Chat with AI Assistant
                    </h3>
                    <p className="card-subtitle mb-0">Describe symptoms and get AI insights</p>
                  </div>
                  {chatHistory.length > 0 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => dispatch(clearChatHistory())}
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-trash-alt me-1"></i>
                      Clear History
                    </Button>
                  )}
                </div>
              </Card.Header>
              
              <Card.Body className="card-body chat-body">
                {/* Chat History Container */}
                <div className="chat-history-container">
                  {chatHistory.length === 0 ? (
                    <div className="empty-chat">
                      <i className="fas fa-robot fa-2x mb-3"></i>
                      <p>Start a conversation with the AI assistant</p>
                      <small className="text-muted">Describe symptoms, ask questions, or get recommendations</small>
                    </div>
                  ) : (
                    <div className="chat-messages">
                      {chatHistory.map((message) => (
                        <div 
                          key={message.id} 
                          className={`chat-message ${message.type}`}
                        >
                          <div className="message-header">
                            <span className="message-sender">
                              {message.type === 'user' ? (
                                <><i className="fas fa-user me-2"></i>You</>
                              ) : (
                                <><i className="fas fa-robot me-2"></i>AI Assistant</>
                              )}
                            </span>
                            <span className="message-time">{message.timestamp}</span>
                          </div>
                          <div className="message-content">{message.content}</div>
                          {message.insights && message.insights.length > 0 && (
                            <div className="message-insights">
                              {message.insights.slice(0, 2).map((insight, idx) => (
                                <Badge key={idx} bg="info" className="me-2 mb-1">
                                  {insight}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Input Area - Sticky at bottom */}
                <div className="chat-input-area">
                  {errors.chatSubmit && (
                    <Alert 
                      variant="danger" 
                      dismissible 
                      onClose={() => dispatch(clearError('chatSubmit'))}
                      className="mb-3"
                    >
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {errors.chatSubmit}
                    </Alert>
                  )}
                  
                  {chatValidationErrors.chatNotes && (
                    <Alert variant="warning" className="mb-3 py-2">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {chatValidationErrors.chatNotes}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleChatSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <i className="fas fa-notes-medical me-2"></i>
                        Clinical Notes
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Describe patient symptoms, observations, or ask AI for recommendations..."
                        value={chatNotes}
                        onChange={handleChatChange}
                        className={`chat-textarea ${chatValidationErrors.chatNotes ? 'is-invalid' : ''}`}
                        disabled={isSubmitting}
                      />
                    </Form.Group>
                    
                    <div className="chat-actions">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting || !chatNotes.trim()}
                        className="submit-button"
                      >
                        {isSubmitting && submitStatus === 'loading' ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Send to AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleClearChat}
                        disabled={!chatNotes.trim() || isSubmitting}
                      >
                        <i className="fas fa-times me-2"></i>
                        Clear
                      </Button>
                    </div>
                  </Form>
                </div>
              </Card.Body>
            </Card>

            {/* AI Chat Response Panel */}
            {chatAiResponse && (
              <Card className="dashboard-card ai-response-card mt-3">
                <Card.Header className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">
                      <i className="fas fa-robot me-2"></i>
                      AI Analysis
                      <Badge bg="light" text="success" className="ms-2 confidence-badge">
                        {chatAiResponse.confidence}% Confidence
                      </Badge>
                    </h4>
                    <Button
                      variant="link"
                      className="text-muted p-0"
                      onClick={handleClearAI}
                      size="sm"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="ai-response-content">
                    <div className="ai-summary">
                      <h6 className="section-title">
                        <i className="fas fa-file-contract me-2"></i>
                        Summary
                      </h6>
                      <p className="summary-text">{chatAiResponse.summary}</p>
                    </div>
                    
                    <Row className="mt-3">
                      <Col md={6}>
                        <div className="ai-section">
                          <h6 className="section-title">
                            <i className="fas fa-lightbulb me-2"></i>
                            Key Insights
                          </h6>
                          <ul className="ai-list">
                            {chatAiResponse.insights.map((insight, index) => (
                              <li key={index}>
                                <i className="fas fa-check-circle text-success me-2"></i>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="ai-section">
                          <h6 className="section-title">
                            <i className="fas fa-forward me-2"></i>
                            Next Steps
                          </h6>
                          <ul className="ai-list">
                            {chatAiResponse.nextSteps.map((step, index) => (
                              <li key={index}>
                                <i className="fas fa-arrow-right text-primary me-2"></i>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* RIGHT COLUMN - Form Interface (60%) */}
          <Col lg={7} xl={8} className="form-column">
            <Card className="dashboard-card form-card">
              <Card.Header className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="card-title mb-0">
                      <i className="fas fa-file-medical me-2"></i>
                      Structured Interaction Form
                    </h3>
                    <p className="card-subtitle mb-0">Enter detailed patient interaction data</p>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleResetForm}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-redo me-1"></i>
                    Reset
                  </Button>
                </div>
              </Card.Header>
              
              <Card.Body className="card-body form-body">
                {errors.formSubmit && (
                  <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => dispatch(clearError('formSubmit'))}
                    className="mb-3"
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.formSubmit}
                  </Alert>
                )}
                
                {/* Form Validation Errors */}
                {(formValidationErrors.patientId || formValidationErrors.duration) && (
                  <Alert variant="warning" className="mb-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Please fix the following errors:
                    <ul className="mb-0 mt-2">
                      {formValidationErrors.patientId && (
                        <li>Patient ID is required</li>
                      )}
                      {formValidationErrors.duration && (
                        <li>Duration is required</li>
                      )}
                    </ul>
                  </Alert>
                )}
                
                <Form onSubmit={handleFormSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label required">
                          <i className="fas fa-user-injured me-2"></i>
                          Patient ID
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-id-card"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleFormChange}
                            placeholder="Enter Patient ID or Name"
                            isInvalid={!!formValidationErrors.patientId}
                            disabled={isSubmitting}
                          />
                        </InputGroup>
                        {formValidationErrors.patientId && (
                          <Form.Control.Feedback type="invalid">
                            {formValidationErrors.patientId}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label">
                          <i className="fas fa-calendar-check me-2"></i>
                          Interaction Type
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-stethoscope"></i>
                          </InputGroup.Text>
                          <Form.Select
                            name="interactionType"
                            value={formData.interactionType}
                            onChange={handleFormChange}
                            disabled={isSubmitting}
                          >
                            {interactionTypes.map(type => (
                              <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                              </option>
                            ))}
                          </Form.Select>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label">
                          <i className="fas fa-calendar-alt me-2"></i>
                          Date
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-calendar"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleFormChange}
                            disabled={isSubmitting}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label required">
                          <i className="fas fa-clock me-2"></i>
                          Duration (minutes)
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-hourglass-half"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleFormChange}
                            placeholder="e.g., 30"
                            isInvalid={!!formValidationErrors.duration}
                            disabled={isSubmitting}
                          />
                        </InputGroup>
                        {formValidationErrors.duration && (
                          <Form.Control.Feedback type="invalid">
                            {formValidationErrors.duration}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      <i className="fas fa-thermometer-half me-2"></i>
                      Symptoms & Observations
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="fas fa-notes-medical"></i>
                      </InputGroup.Text>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleFormChange}
                        placeholder="Describe symptoms, vital signs, and observations"
                        disabled={isSubmitting}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label">
                          <i className="fas fa-diagnoses me-2"></i>
                          Diagnosis
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-file-medical-alt"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleFormChange}
                            placeholder="Enter primary diagnosis"
                            disabled={isSubmitting}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="form-label">
                          <i className="fas fa-pills me-2"></i>
                          Prescription
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <i className="fas fa-prescription-bottle-alt"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="prescription"
                            value={formData.prescription}
                            onChange={handleFormChange}
                            placeholder="Medication, dosage, frequency"
                            disabled={isSubmitting}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label">
                      <i className="fas fa-calendar-plus me-2"></i>
                      Follow-up Date
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="fas fa-calendar-check"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleFormChange}
                        disabled={isSubmitting}
                      />
                    </InputGroup>
                  </Form.Group>

                  <div className="form-actions">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting || Object.keys(formValidationErrors).length > 0}
                      className="submit-button"
                    >
                      {isSubmitting && submitStatus === 'loading' ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Logging Interaction...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Log Interaction
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      onClick={handleResetForm}
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Reset Form
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* AI Recommendations Panel for Form */}
            {formAiResponse && (
              <Card className="dashboard-card recommendations-card mt-3">
                <Card.Header className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">
                      <i className="fas fa-chart-line me-2"></i>
                      AI Recommendations
                      <Badge bg="light" text="success" className="ms-2 confidence-badge">
                        {formAiResponse.confidence}% Confidence
                      </Badge>
                    </h4>
                    <Button
                      variant="link"
                      className="text-muted p-0"
                      onClick={handleClearAI}
                      size="sm"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="ai-recommendations">
                    <div className="recommendation-section">
                      <h6 className="section-title">
                        <i className="fas fa-clipboard-check me-2"></i>
                        Clinical Insights
                      </h6>
                      <div className="insights-grid">
                        {formAiResponse.insights.map((insight, index) => (
                          <div key={index} className="insight-item">
                            <div className="insight-icon">
                              <i className="fas fa-check-circle text-success"></i>
                            </div>
                            <div className="insight-content">
                              <p className="mb-0">{insight}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="recommendation-section mt-4">
                      <h6 className="section-title">
                        <i className="fas fa-tasks me-2"></i>
                        Action Items
                      </h6>
                      <div className="action-items">
                        {formAiResponse.nextSteps.map((step, index) => (
                          <div key={index} className="action-item">
                            <span className="action-number">{index + 1}</span>
                            <div className="action-content">
                              <p className="mb-0">{step}</p>
                              <small className="text-muted">
                                <i className="fas fa-clock me-1"></i>
                                Recommended within 48 hours
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Dashboard Footer with Redux Status */}
      <footer className="dashboard-footer">
        <Container fluid>
          <div className="footer-content">
            <div className="footer-info">
              <small>
                <i className="fas fa-shield-alt me-1"></i>
                HIPAA Compliant • End-to-end encrypted • v1.0.0 (Redux)
              </small>
            </div>
            <div className="footer-stats">
              <small>
                <i className="fas fa-database me-1"></i>
                State: {submitStatus} • 
                <i className="fas fa-history ms-2 me-1"></i>
                Interactions: {chatHistory.length} • 
                <i className="fas fa-clock ms-2 me-1"></i>
                Status: {isSubmitting ? 'Processing...' : 'Ready'}
              </small>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LogInteraction;