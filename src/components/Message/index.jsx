import React from 'react';
import './index.less';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageType: 'direct', // 'direct' 或 'announcement'
            priority: 'medium', // 'low', 'medium', 'high'
            color: '#000000',
            recipients: 'dz07;',
            subject: '',
            content: '',
            attachments: []
        };
    }

    handleMessageTypeChange = (type) => {
        this.setState({ messageType: type });
    };

    handlePriorityChange = (e) => {
        this.setState({ priority: e.target.value });
    };

    handleColorChange = (e) => {
        this.setState({ color: e.target.value });
    };

    handleRecipientsChange = (e) => {
        this.setState({ recipients: e.target.value });
    };

    handleSubjectChange = (e) => {
        this.setState({ subject: e.target.value });
    };

    handleContentChange = (e) => {
        this.setState({ content: e.target.value });
    };

    // 已废弃，使用handleFileSelect替代
    // handleAttachmentChange = (e) => {
    //     this.setState({ attachment: e.target.value });
    // };

    handleCancel = () => {
        this.setState({
            messageType: 'direct',
            priority: 'medium', // 保持与构造函数一致
            color: '#000000', // 保持与构造函数一致
            recipients: 'dz07;', // 保持与构造函数一致
            subject: '',
            content: '',
            attachments: []
        });
    }

    handleAttachmentClick = (e) => {
        e.preventDefault();
        this.fileInput.click();
    }

    handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // 读取现有文件的名称，用于去重
            const existingFileNames = this.state.attachments.map(attach => attach.name);
            
            // 过滤出新的唯一文件
            const newUniqueFiles = files.filter(file => !existingFileNames.includes(file.name));
            
            // 直接存储完整的File对象
            if (newUniqueFiles.length > 0) {
                this.setState(prevState => ({
                    attachments: [...prevState.attachments, ...newUniqueFiles]
                }));
            }
        }
        
        // 清空input，允许重复选择同一文件
        e.target.value = '';
    }

    // 删除单个附件
    handleRemoveAttachment = (index) => {
        const newAttachments = [...this.state.attachments];
        newAttachments.splice(index, 1);
        this.setState({ attachments: newAttachments });
    }

    // 获取表单所有数据的封装方法
    getFormData = () => {
        const { messageType, priority, color, recipients, subject, content, attachments } = this.state;
        return {
            messageType,
            priority,
            color,
            recipients,
            subject,
            content,
            attachments // 这里返回完整的File对象数组，可直接用于FormData
        };
    }

    handleSend = () => {
        // 调用封装方法获取所有表单数据
        const formData = this.getFormData();
        
        // 准备用于发送到后端的数据
        const dataToSend = {
            ...formData,
            // 对于打印，我们不直接显示File对象（浏览器会显示为[object File]）
            attachments: formData.attachments.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            }))
        };
        
        console.log('发送消息:', dataToSend);
        
        // 创建FormData对象，适用于文件上传
        const formDataForUpload = new FormData();
        formDataForUpload.append('messageType', formData.messageType);
        formDataForUpload.append('priority', formData.priority);
        formDataForUpload.append('color', formData.color);
        formDataForUpload.append('recipients', formData.recipients);
        formDataForUpload.append('subject', formData.subject);
        formDataForUpload.append('content', formData.content);
        
        // 添加每个文件到FormData
        formData.attachments.forEach((file, index) => {
            formDataForUpload.append(`attachments[${index}]`, file);
        });
        
        // 这里可以添加实际的发送逻辑，使用formDataForUpload发送到后端
        // 例如: fetch('/api/messages', { method: 'POST', body: formDataForUpload });
        
        alert('消息已发送！');
        this.handleCancel();
    }

    render() {
        return (
            <div className="message-container">
                <div className="message-header">
                    <h3>消息发送</h3>
                    <button className="close-btn">×</button>
                </div>
                
                <div className="message-body">
                    <div className="message-type-selection">
                        <label className="radio-label">
                            <input 
                                type="radio" 
                                name="messageType" 
                                value="direct" 
                                checked={this.state.messageType === 'direct'} 
                                onChange={() => this.handleMessageTypeChange('direct')} 
                            />
                            对发消息
                        </label>
                        <label className="radio-label">
                            <input 
                                type="radio" 
                                name="messageType" 
                                value="announcement" 
                                checked={this.state.messageType === 'announcement'} 
                                onChange={() => this.handleMessageTypeChange('announcement')} 
                            />
                            公告消息
                        </label>
                        
                        <div className="priority-selection">
                            <label>优先级：</label>
                            <select value={this.state.priority} onChange={this.handlePriorityChange}>
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                            </select>
                        </div>
                        
                        <div className="color-selection">
                            <label>颜色：</label>
                            <input 
                                type="color" 
                                value={this.state.color} 
                                onChange={this.handleColorChange} 
                                className="color-picker"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">接收人</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={this.state.recipients} 
                            onChange={this.handleRecipientsChange} 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">主题</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={this.state.subject} 
                            onChange={this.handleSubjectChange} 
                            placeholder="请输入主题"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">内容</label>
                        <textarea 
                            className="form-textarea" 
                            value={this.state.content} 
                            onChange={this.handleContentChange} 
                            placeholder="请输入内容"
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <button className="attachment-btn" onClick={(e) => this.handleAttachmentClick(e)}>附件</button>
                        <div className="attachments-container">
                            {this.state.attachments.length > 0 ? (
                                this.state.attachments.map((file, index) => (
                                    <div key={index} className="attachment-tag">
                                        <span className="attachment-filename">{file.name}</span>
                                        <button 
                                            className="remove-attachment-btn" 
                                            onClick={() => this.handleRemoveAttachment(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-attachments">请选择附件（可多选）</div>
                            )}
                        </div>
                        <input
                            type="file"
                            style={{ display: 'none' }}
                            ref={(input) => this.fileInput = input}
                            onChange={this.handleFileSelect}
                            multiple
                        />
                    </div>
                </div>

                <div className="message-footer">
                    <button className="send-btn" onClick={this.handleSend}>发送(S)</button>
                    <button className="cancel-btn" onClick={this.handleCancel}>取消</button>
                </div>
            </div>
        );
    }
}

export default Message;