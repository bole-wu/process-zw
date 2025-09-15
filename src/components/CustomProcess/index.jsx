import React from 'react';
import './index.less';

const statusColors = {
    completed: {
        background: '#f6ffed',
        border: '#b7eb8f',
        text: '#52c41a'
    },
    active: {
        background: '#e6f7ff',
        border: '#91d5ff',
        text: '#1890ff'
    },
    pending: {
        background: '#fafafa',
        border: '#d9d9d9',
        text: '#666'
    }
};

const defaultNodes = [
    { processid: 'start', title: '项目启动', type: 'process', status: 'completed', x: 150, y: 250, icon: '🚀' },
    { processid: 'req', title: '需求调研', type: 'process', status: 'completed', x: 350, y: 250, icon: '📊' },
    { processid: 'plan', title: '项目规划', type: 'process', status: 'active', x: 550, y: 250, icon: '📋' },
    { processid: 'arch', title: '架构设计', type: 'process', status: 'pending', x: 750, y: 150, icon: '🏗️' },
    { processid: 'ui', title: 'UI设计', type: 'process', status: 'pending', x: 750, y: 350, icon: '🎨' },
    { processid: 'frontend', title: '前端开发', type: 'process', status: 'pending', x: 950, y: 100, icon: '💻' },
    { processid: 'backend', title: '后端开发', type: 'process', status: 'pending', x: 950, y: 200, icon: '⚙️' },
    { processid: 'database', title: '数据库设计', type: 'process', status: 'pending', x: 950, y: 300, icon: '🗄️' },
    { processid: 'api', title: '接口联调', type: 'process', status: 'pending', x: 1150, y: 150, icon: '🔗' },
    //   { processid: 'test', title: '测试验证', type: 'process', status: 'pending', x: 1150, y: 300, icon: '🔍' },
    //   { processid: 'staging', title: '预发布环境', type: 'process', status: 'pending', x: 1350, y: 200, icon: '📦' },
    //   { processid: 'prod', title: '生产部署', type: 'end', status: 'pending', x: 1550, y: 250, icon: '🌟' },
    //   { processid: 'review', title: '代码审查', type: 'process', status: 'pending', x: 550, y: 400, icon: '👀' },
    //   { processid: 'doc', title: '文档编写', type: 'process', status: 'pending', x: 350, y: 400, icon: '📚' },
    //   { processid: 'deploy_config', title: '部署配置', type: 'process', status: 'pending', x: 1350, y: 100, icon: '⚙️' }
];

const defaultEdges = [
    { from: 'start', to: 'req' },
    { from: 'req', to: 'plan' },
    { from: 'plan', to: 'arch' },
    { from: 'plan', to: 'ui' },
    { from: 'arch', to: 'frontend' },
    { from: 'arch', to: 'backend' },
    // { from: 'arch', to: 'start' },
    { from: 'arch', to: 'database' },
    { from: 'frontend', to: 'api' },
    { from: 'backend', to: 'api' },
    { from: 'database', to: 'api' },
    { from: 'arch', to: 'database' },
    { from: 'ui', to: 'frontend' },
    { from: 'frontend', to: 'api' },
    { from: 'backend', to: 'api' },
    { from: 'database', to: 'test' },
    { from: 'api', to: 'staging' },
    //   { from: 'test', to: 'staging' },
    //   { from: 'staging', to: 'prod' },
    //   { from: 'frontend', to: 'review' },
    //   { from: 'backend', to: 'review' },
    //   { from: 'review', to: 'doc' },
    //   { from: 'doc', to: 'prod' },
    //   { from: 'database', to: 'deploy_config' },
    //   { from: 'deploy_config', to: 'staging' },
    //   { from: 'deploy_config', to: 'prod' }
];

class CustomProcess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            position: { x: 0, y: 0 },
            dragStart: { x: 0, y: 0 },
            nodes: [], // 从服务端加载的节点数据
            edges: [], // 从服务端加载的连接关系
            loading: true, // 加载状态
            error: null, // 错误信息
            hoveredNode: null, // 当前悬停的节点
            showApprovalModal: false, // 显示审批弹窗
            approvingNode: null, // 正在审批的节点
            showHoverApproval: false, // 悬停审批按钮显示
            hoverApprovalNode: null // 悬停审批的节点
        };
        this.containerRef = React.createRef();

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleNodeMouseEnter = this.handleNodeMouseEnter.bind(this);
        this.handleNodeMouseLeave = this.handleNodeMouseLeave.bind(this);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.approveNode = this.approveNode.bind(this);
        this.loadDataFromServer = this.loadDataFromServer.bind(this);
        this.handleNodeMouseEnterApproval = this.handleNodeMouseEnterApproval.bind(this);
        this.handleNodeMouseLeaveApproval = this.handleNodeMouseLeaveApproval.bind(this);
        this.quickApproveNode = this.quickApproveNode.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);

        // 从服务端加载数据
        this.loadDataFromServer();
    }

    /**
     * 从服务端加载节点和连接数据
     * 支持多种数据格式：
     * 1. 直接返回节点数组和边数组
     * 2. 返回包含nodes和edges的对象
     * 3. 支持Promise和回调函数
     */
    async loadDataFromServer() {
        try {
            this.setState({ loading: true, error: null });

            // 检查是否通过props传入数据
            if (this.props.nodes && this.props.edges) {
                this.setState({
                    nodes: this.props.nodes,
                    edges: this.props.edges,
                    loading: false
                });
                return;
            }

            // 检查是否有服务端数据获取函数
            if (this.props.fetchData) {
                const data = await this.props.fetchData();
                this.setState({
                    nodes: data.nodes || data,
                    edges: data.edges || [],
                    loading: false
                });
                return;
            }

            // 模拟服务端API调用（实际项目中替换为真实API）
            // 这里演示如何从服务端获取数据
            const response = await this.fetchProcessData();
            this.setState({
                nodes: response.nodes,
                edges: response.edges,
                loading: false
            });

        } catch (error) {
            console.error('加载服务端数据失败:', error);
            // 使用默认数据作为fallback
            this.setState({
                nodes: defaultNodes,
                edges: defaultEdges,
                loading: false,
                error: '使用默认数据'
            });
        }
    }

    /**
     * 模拟从服务端获取数据的函数
     * 实际项目中替换为真实的API调用
     * 示例返回格式：
     * {
     *   nodes: [
     *     { processid: 'node1', title: '节点1', x: 100, y: 200, ... },
     *     { processid: 'node2', title: '节点2', x: 300, y: 200, ... }
     *   ],
     *   edges: [
     *     { from: 'node1', to: 'node2' }
     *   ]
     * }
     */
    async fetchProcessData() {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 这里可以替换为真实的API调用
        // 例如：return fetch('/api/process-data').then(res => res.json());

        // 返回默认数据作为示例
        return {
            nodes: defaultNodes,
            edges: defaultEdges
        };
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown(e) {
        this.setState({
            isDragging: true,
            dragStart: {
                x: e.clientX - this.state.position.x,
                y: e.clientY - this.state.position.y
            }
        });
        if (this.containerRef.current) {
            this.containerRef.current.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        if (!this.state.isDragging) return;
        this.setState({
            position: {
                x: e.clientX - this.state.dragStart.x,
                y: e.clientY - this.state.dragStart.y
            }
        });
    }

    handleMouseUp() {
        this.setState({ isDragging: false });
        if (this.containerRef.current) {
            this.containerRef.current.style.cursor = 'grab';
        }
    }

    handleMouseLeave() {
        this.setState({ isDragging: false });
        if (this.containerRef.current) {
            this.containerRef.current.style.cursor = 'grab';
        }
    }

    calculateConnectionPoints(fromNode, toNode) {
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 节点半径
        const fromRadius = 32;
        const toRadius = 32;

        // 箭头安全距离：确保箭头完全在节点外部
        const arrowSafeDistance = 12; // 增加到12px确保完全避开节点

        const unitX = dx / distance;
        const unitY = dy / distance;

        // 起点：从源节点边缘开始
        const x1 = fromNode.x + unitX * fromRadius;
        const y1 = fromNode.y + unitY * fromRadius;

        // 终点：箭头终点距离目标节点边缘安全距离
        const x2 = toNode.x - unitX * (toRadius + arrowSafeDistance);
        const y2 = toNode.y - unitY * (toRadius + arrowSafeDistance);

        return { x1, y1, x2, y2 };
    }

    /**
     * 根据跨节点情况生成SVG路径
     * @param {number} x1 - 起点x坐标
     * @param {number} y1 - 起点y坐标
     * @param {number} x2 - 终点x坐标
     * @param {number} y2 - 终点y坐标
     * @returns {string} 根据跨节点情况选择直线或弧线的SVG路径
     * 
     * 功能说明：
     * - 跨节点流程（连线穿过中间节点）使用弧线连接
     * - 清晰路径（无中间节点阻挡）使用直线连接
     */
    getAntVPath(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 节点半径（用于跨节点检测）
        const nodeRadius = 32;

        // 检测是否为跨节点流程
        const isCrossNode = this.checkCrossNodeFlow(x1, y1, x2, y2, nodeRadius);

        // 非跨节点使用直线连接
        if (!isCrossNode) {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        // 跨节点流程使用优美弧线连接
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // 计算垂直方向向量（用于弧线偏移）
        const perpX = -dy / distance;
        const perpY = dx / distance;

        // 根据跨节点程度计算优雅的弧线偏移
        let offsetDistance = nodeRadius + 20;

        // 距离越近，弧线弯曲越大
        if (distance < nodeRadius * 4) {
            offsetDistance = nodeRadius + 30;
        }

        // 使用三次贝塞尔曲线生成优美弧线
        const cp1x = x1 + dx * 0.25 + perpX * offsetDistance;
        const cp1y = y1 + dy * 0.25 + perpY * offsetDistance;
        const cp2x = x2 - dx * 0.25 + perpX * offsetDistance;
        const cp2y = y2 - dy * 0.25 + perpY * offsetDistance;

        return `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
    }

    /**
     * 检测是否为跨节点流程
     * @param {number} x1 - 起点x
     * @param {number} y1 - 起点y
     * @param {number} x2 - 终点x
     * @param {number} y2 - 终点y
     * @param {number} radius - 节点半径
     * @returns {boolean} 是否跨节点（连线穿过中间节点）
     */
    checkCrossNodeFlow(x1, y1, x2, y2, radius) {
        // 简化检测：检查是否有任何节点位于连线路径上
        for (const node of this.state.nodes) {
            // 跳过起点和终点的节点
            const isStartNode = Math.abs(node.x - x1) < 5 && Math.abs(node.y - y1) < 5;
            const isEndNode = Math.abs(node.x - x2) < 5 && Math.abs(node.y - y2) < 5;

            if (isStartNode || isEndNode) {
                continue;
            }

            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);

            if (len === 0) continue;

            // 计算点到线段的垂直距离
            const t = Math.max(0, Math.min(1, ((node.x - x1) * dx + (node.y - y1) * dy) / (len * len)));
            const projX = x1 + t * dx;
            const projY = y1 + t * dy;
            const distance = Math.sqrt((node.x - projX) ** 2 + (node.y - projY) ** 2);

            // 检查节点是否实际位于连线路径上
            if (distance < radius + 5) {
                // 检查节点是否在连线段的合理范围内
                const minX = Math.min(x1, x2) - radius;
                const maxX = Math.max(x1, x2) + radius;
                const minY = Math.min(y1, y2) - radius;
                const maxY = Math.max(y1, y2) + radius;

                if (node.x >= minX && node.x <= maxX && node.y >= minY && node.y <= maxY) {
                    // 检查投影点是否在连线段内（排除端点）
                    const t2 = ((node.x - x1) * dx + (node.y - y1) * dy) / (len * len);
                    if (t2 > 0.15 && t2 < 0.85) {
                        return true; // 发现跨节点阻挡
                    }
                }
            }
        }

        return false; // 无跨节点阻挡
    }

    getLineColor(fromNode, toNode) {
        if (fromNode.status === 'completed') return '#52c41a';
        if (fromNode.status === 'active') return '#1890ff';
        return '#c2c8d5'; // AntV X6标准灰色
    }

    getArrowMarker(fromNode, toNode) {
        if (fromNode.status === 'completed' && toNode.status === 'completed') {
            return 'url(#arrowhead-active)';
        }
        return 'url(#arrowhead)';
    }

    /**
     * 处理节点鼠标进入事件 - 用于高亮显示
     */
    handleNodeMouseEnter(node) {
        if (node.status === 'active' || node.status === 'pending') {
            this.setState({ hoveredNode: node });
        }
    }

    /**
     * 处理节点鼠标离开事件
     */
    handleNodeMouseLeave() {
        this.setState({ hoveredNode: null });
    }

    /**
     * 处理节点鼠标进入事件 - 用于显示悬停审批按钮
     */
    handleNodeMouseEnterApproval(node) {
        if (node.status === 'active' || node.status === 'pending') {
            this.setState({
                showHoverApproval: true,
                hoverApprovalNode: node
            });
        }
    }

    /**
     * 处理节点鼠标离开事件 - 隐藏悬停审批按钮
     */
    handleNodeMouseLeaveApproval() {
        this.setState({
            showHoverApproval: false,
            hoverApprovalNode: null
        });
    }

    /**
     * 处理节点点击事件
     */
    handleNodeClick(node) {
        if (node.status === 'active' || node.status === 'pending') {
            this.setState({
                showApprovalModal: true,
                approvingNode: node
            });
        }
    }

    /**
     * 快速审批节点 - 悬停时直接审批
     */
    quickApproveNode(node) {
        if (!node || !node.processid) return;

        // 直接调用审批逻辑，不显示弹窗
        this.approveNode(node, true);
    }

    /**
     * 审批节点
     * @param {Object} node - 要审批的节点
     * @param {boolean} isQuickApproval - 是否为快速审批（悬停审批）
     */
    async approveNode(node, isQuickApproval = false) {
        try {
            if (!node || !node.processid) {
                throw new Error('无效的节点数据');
            }

            if (!Array.isArray(this.state.nodes) || !Array.isArray(this.state.edges)) {
                throw new Error('节点或边数据格式错误');
            }

            const { nodes, edges } = this.state;

            // 获取所有需要完成的节点：当前节点 + 所有指向当前节点的上游节点链
            const nodesToComplete = new Set();

            // 1. 添加当前节点
            nodesToComplete.add(node.processid);

            // 2. 递归添加所有指向当前节点的上游节点（带循环检测）
            const addUpstreamNodes = (targetId, visited = new Set()) => {
                if (visited.has(targetId)) return; // 防止循环
                visited.add(targetId);

                edges.forEach(edge => {
                    const source = edge.source || edge.from;
                    const target = edge.target || edge.to;
                    if (target === targetId && source !== targetId) {
                        nodesToComplete.add(source);
                        // 递归添加上游节点，传递已访问集合
                        addUpstreamNodes(source, visited);
                    }
                });
            };

            addUpstreamNodes(node.processid);

            // 更新所有相关节点为completed
            const updatedNodes = nodes.map(n =>
                nodesToComplete.has(n.processid) ? { ...n, status: 'completed' } : n
            );

            // 查找所有后续节点并更新为active（如果所有前置节点都已完成）
            const nextNodes = [];
            updatedNodes.forEach(n => {
                if (n.status === 'pending') {
                    const predecessors = this.getAllPredecessors(n.processid, updatedNodes, edges);
                    const allPredecessorsCompleted = predecessors.every(predId => {
                        const predNode = updatedNodes.find(node => node.processid === predId);
                        return predNode && predNode.status === 'completed';
                    });

                    if (allPredecessorsCompleted && predecessors.length > 0) {
                        nextNodes.push(n.processid);
                    }
                }
            });

            const finalNodes = updatedNodes.map(n =>
                nextNodes.includes(n.processid) ? { ...n, status: 'active' } : n
            );

            this.setState({ nodes: finalNodes });

            // 隐藏审批弹窗或悬停审批按钮
            if (isQuickApproval) {
                this.setState({ showHoverApproval: false, hoverApprovalNode: null });
            } else {
                this.setState({ showApprovalModal: false, approvingNode: null });
            }

            console.log('节点审批完成:', node.processid, '完成的节点:', Array.from(nodesToComplete));
            console.log('原始节点:', nodes.map(n => ({ processid: n.processid, status: n.status })));
            console.log('最终节点:', finalNodes.map(n => ({ processid: n.processid, status: n.status })));
            console.log('边信息:', edges);

        } catch (error) {
            console.error('审批节点时发生错误:', error);
            this.setState({
                error: `审批失败: ${error.message}`,
                showApprovalModal: false,
                approvingNode: null,
                showHoverApproval: false,
                hoverApprovalNode: null
            });
        }
    }

    /**
     * 获取指定节点的所有前置节点（包括间接前置节点）
     * @param {string} nodeId - 目标节点ID
     * @param {Array} nodes - 所有节点
     * @param {Array} edges - 所有边
     * @returns {Array} - 前置节点ID数组
     */
    getAllPredecessors(nodeId, nodes, edges) {
        const predecessors = new Set();
        const visited = new Set(); // 防止循环

        const findPredecessors = (currentId) => {
            if (visited.has(currentId)) return;
            visited.add(currentId);

            edges.forEach(edge => {
                const source = edge.source || edge.from;
                const target = edge.target || edge.to;
                if (target === currentId && source !== currentId) {
                    if (!predecessors.has(source)) {
                        predecessors.add(source);
                        findPredecessors(source);
                    }
                }
            });
        };

        findPredecessors(nodeId);
        return Array.from(predecessors);
    }

    render() {
        const { isDragging, position, nodes, edges, loading, error } = this.state;

        // 加载状态
        if (loading) {
            return (
                <div className="custom-process" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '600px',
                    fontSize: '16px',
                    color: '#666'
                }}>
                    <div>🔄 正在加载流程图数据...</div>
                </div>
            );
        }

        // 错误状态
        if (error) {
            return (
                <div className="custom-process" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '600px',
                    fontSize: '16px',
                    color: '#ff4d4f'
                }}>
                    <div>⚠️ {error}</div>
                </div>
            );
        }

        // 空数据状态
        if (!nodes || nodes.length === 0) {
            return (
                <div className="custom-process" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '600px',
                    fontSize: '16px',
                    color: '#666'
                }}>
                    <div>📋 暂无流程数据</div>
                </div>
            );
        }

        const statusColors = {
            pending: '#faad14',
            active: '#1890ff',
            completed: '#52c41a',
            error: '#f5222d'
        };

        const getNodeStyle = (node) => {
            // 标准AntV X6节点样式
            const isCircle = node.type === 'start' || node.type === 'end';
            const baseStyle = {
                position: 'absolute',
                left: node.x - 32,
                top: node.y - 32,
                width: 64,
                height: 64,
                borderRadius: isCircle ? '50%' : '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: '#fff',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                zIndex: 2,
                border: '2px solid',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
            };

            // AntV X6标准色彩系统
            const colorSystem = {
                start: {
                    bg: '#52c41a',
                    border: '#389e0d'
                },
                end: {
                    bg: '#ff4d4f',
                    border: '#cf1322'
                },
                process: {
                    pending: { bg: '#fafafa', border: '#d9d9d9', color: '#595959' },
                    active: { bg: '#e6f7ff', border: '#1890ff', color: '#096dd9' },
                    completed: { bg: '#f6ffed', border: '#52c41a', color: '#389e0d' },
                    error: { bg: '#fff2f0', border: '#ff4d4f', color: '#cf1322' }
                }
            };

            if (node.type === 'start') {
                baseStyle.backgroundColor = colorSystem.start.bg;
                baseStyle.borderColor = colorSystem.start.border;
            } else if (node.type === 'end') {
                baseStyle.backgroundColor = colorSystem.end.bg;
                baseStyle.borderColor = colorSystem.end.border;
            } else {
                const processColor = colorSystem.process[node.status] || colorSystem.process.pending;
                baseStyle.backgroundColor = processColor.bg;
                baseStyle.borderColor = processColor.border;
                baseStyle.color = processColor.color;
            }

            if (node.status === 'active') {
                baseStyle.boxShadow = '0 0 0 3px rgba(24, 144, 255, 0.15)';
                baseStyle.transform = 'scale(1.05)';
            }

            return baseStyle;
        };



        return (
            <div
                className="custom-process"
                ref={this.containerRef}
                style={{
                    width: '99%',
                    height: '600px',
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    cursor: 'grab',
                    position: 'relative',
                    userSelect: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                onMouseDown={this.handleMouseDown}
                onMouseLeave={this.handleMouseLeave}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '500px',
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}>
                    {/* 连接线 - 使用SVG覆盖 */}
                    <svg style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '500px',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}>
                        {edges.map((edge, index) => {
                            const fromNode = nodes.find(n => n.processid === edge.from);
                            const toNode = nodes.find(n => n.processid === edge.to);
                            if (!fromNode || !toNode) return null;

                            const { x1, y1, x2, y2 } = this.calculateConnectionPoints(fromNode, toNode);

                            const pathData = this.getAntVPath(x1, y1, x2, y2);
                            const lineColor = this.getLineColor(fromNode, toNode);
                            const arrowMarker = this.getArrowMarker(fromNode, toNode);

                            return (
                                <g key={index}>
                                    <path
                                        d={pathData}
                                        stroke={lineColor}
                                        strokeWidth="1"
                                        fill="none"
                                        markerEnd={arrowMarker}
                                        style={{
                                            transition: 'all 0.2s ease',
                                            strokeLinecap: 'round'
                                        }}
                                    />
                                    {edge.label && (
                                        <text
                                            x={(x1 + x2) / 2}
                                            y={(y1 + y2) / 2 - 8}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill="#262626"
                                            fontWeight="500"
                                            style={{
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
                                            }}
                                        >
                                            {edge.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="10"
                                refY="3.5"
                                orient="auto"
                                markerUnits="userSpaceOnUse"
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill="#1890ff" stroke="none" />
                            </marker>
                            <marker
                                id="arrowhead-active"
                                markerWidth="10"
                                markerHeight="7"
                                refX="10"
                                refY="3.5"
                                orient="auto"
                                markerUnits="userSpaceOnUse"
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill="#52c41a" stroke="none" />
                            </marker>
                        </defs>
                    </svg>

                    {/* 节点 */}
                    {nodes.map(node => (
                        <div
                            key={node.processid}
                            style={getNodeStyle(node)}
                            onMouseEnter={() => {
                                this.handleNodeMouseEnter(node);
                                this.handleNodeMouseEnterApproval(node);
                            }}
                            onMouseLeave={() => {
                                this.handleNodeMouseLeave();
                                this.handleNodeMouseLeaveApproval();
                            }}
                            onClick={() => this.handleNodeClick(node)}
                            title={`${node.title} - ${node.status}`}
                        >
                            <div style={{ lineHeight: '1.2' }}>
                                <div>{node.icon}</div>
                                <div style={{ fontSize: '10px', marginTop: '2px' }}>{node.title}</div>
                            </div>

                            {/* 悬停审批按钮 - 绝对定位在节点上方 */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '-15px',
                                    transform: 'translateX(-50%)',
                                    width: 40,
                                    height: 20,
                                    backgroundColor: '#1890ff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    zIndex: 3,
                                    display: this.state.hoverApprovalNode && this.state.hoverApprovalNode.processid === node.processid && (node.status === 'active' || node.status === 'pending') ? 'block' : 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                                    lineHeight: '20px',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    this.handleNodeMouseEnterApproval(node);
                                }}
                                onMouseLeave={(e) => {
                                    e.stopPropagation();
                                    this.handleNodeMouseLeaveApproval();
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.quickApproveNode(node);
                                }}
                            >
                                审批
                            </div>
                        </div>
                    ))}
                </div>

                {/* 审批弹窗 */}
                {this.state.showApprovalModal && this.state.approvingNode && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '320px',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #f0f0f0'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#262626', fontSize: '16px' }}>
                                审批确认
                            </h3>
                            <p style={{ margin: '0 0 20px 0', color: '#595959', fontSize: '14px' }}>
                                是否确认审批节点：
                                <strong style={{ color: '#1890ff' }}>
                                    {this.state.approvingNode.title}
                                </strong>
                                ？
                            </p>
                            <p style={{ margin: '0 0 20px 0', color: '#8c8c8c', fontSize: '12px' }}>
                                注意：审批后当前节点及其所有前置节点将自动设为完成状态
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    style={{
                                        padding: '6px 16px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px',
                                        backgroundColor: '#fff',
                                        color: '#595959',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    onClick={() => this.setState({ showApprovalModal: false, approvingNode: null })}
                                >
                                    取消
                                </button>
                                <button
                                    style={{
                                        padding: '6px 16px',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#1890ff',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    onClick={() => this.approveNode(this.state.approvingNode)}
                                >
                                    确认审批
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default CustomProcess;

