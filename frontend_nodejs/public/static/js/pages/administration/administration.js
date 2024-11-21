window.hardening = {};
window.hardening.allCategories = {};
window.hardening.allTasks = {};
window.hardening.allCommands = {};
window.hardening.selectedCategory = new Proxy({}, {set: handleSetSelectedCategory});
window.hardening.selectedTask = new Proxy({}, {set: handleSetSelectedTask});
window.hardening.categoryForm = new Proxy({}, {set: handleSetCategoryForm});
window.hardening.taskForm = new Proxy({}, {set: handleSetTaskForm});
window.hardening.commandForm = new Proxy({}, {set: handleSetCommandForm});
window.hardening.taskLoading = new Proxy({}, {set: handleSetTaskLoading});
window.hardening.commandLoading = new Proxy({}, {set: handleSetCommandLoading});

function handleError(jqXHR) {
  console.error(jqXHR);
  alert(`Error: ${jqXHR.responseText}`);
}
function safeHtmlEncode(dangerStr) {
  const text = document.createElement('text');
  text.innerText = dangerStr;
  return text.innerHTML;
}

function ajaxCreateCategory(categoryForm) {
  const token = localStorage.getItem('accessToken');
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://localhost:5000/api/categories/',
      method: 'POST',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      data: categoryForm,
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });
}

function ajaxUpdateCategory(categoryForm) {
  const token = localStorage.getItem('accessToken');

  const {id, ...rest} = categoryForm;
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5000/api/categories/${id}/`,
      method: 'PATCH',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      data: {...rest},
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });
}

function ajaxDeleteCategory(categoryId) {
  const token = localStorage.getItem('accessToken');
  console.log("Deleting category with ID:", categoryId);

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5000/api/categories/${categoryId}/`,
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      success: resolve,
      error: reject,
    });
  });
}


function treeCreateChildAction(data) {
  const inst = $.jstree.reference(data.reference);
  const node = inst.get_node(data.reference);
  const newChildPos = node.children.length;
  window.hardening.categoryForm.show = true;
  window.hardening.categoryForm.mode = 'create';
  window.hardening.categoryForm.id = null;
  window.hardening.categoryForm.parentNode = node;
  window.hardening.categoryForm.parent = node.id;
  window.hardening.categoryForm.name = '';
  window.hardening.categoryForm.slug = '';
  window.hardening.categoryForm.cmd = '';
  window.hardening.categoryForm.expect_output = '';
  window.hardening.categoryForm.position = newChildPos;
}

function treeCreateSiblingAction(data) {
  const inst = $.jstree.reference(data.reference);
  const node = inst.get_node(data.reference);
  const parent = inst.get_node(node.parent);
  const nodePos = parent.children.findIndex((cid) => cid === node.id);
  window.hardening.categoryForm.show = true;
  window.hardening.categoryForm.mode = 'create';
  window.hardening.categoryForm.id = null;
  window.hardening.categoryForm.parentNode = parent;
  window.hardening.categoryForm.parent = parent.id;
  window.hardening.categoryForm.name = '';
  window.hardening.categoryForm.slug = '';
  window.hardening.categoryForm.cmd = '';
  window.hardening.categoryForm.expect_output = '';
  window.hardening.categoryForm.position = nodePos + 1;
}

function treeEditNodeAction(data) {
  const inst = $.jstree.reference(data.reference);
  const node = inst.get_node(data.reference);
  const category = window.hardening.allCategories[node.id];
  window.hardening.categoryForm.show = true;
  window.hardening.categoryForm.mode = 'edit';
  window.hardening.categoryForm.id = category.id;
  window.hardening.categoryForm.name = category.name;
  window.hardening.categoryForm.slug = category.slug;
  window.hardening.categoryForm.cmd = category.cmd;
  window.hardening.categoryForm.expect_output = category.expect_output;
}

function treeDeleteNodeAction(data) {
  const inst = $.jstree.reference(data.reference);
  const node = inst.get_node(data.reference);
  handleCategoryDelete(node.id);
}

function treeCheckCallback(operation, node, nodeParent, nodePosition, more) {
  // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node', 'copy_node' or 'edit'
  // in case of 'rename_node' node_position is filled with the new node name
  // console.log('Operation', operation);
  // console.log('Node', node);
  // console.log('NodeParent', nodeParent);
  // console.log('NodePosition', nodePosition);
  // console.log('More', more);
  // console.log('--------------------------------------------------');
  // switch (operation) {
  //   case 'create_node':
  //     break;
  //   case 'rename_node':
  //     break;
  //   case 'delete_node':
  //     break;
  //   case 'move_node':
  //     break;
  //   case 'copy_node':
  //     break;
  //   default:
  //     break;
  // }
  return true;
}

function treeMakeLegalNode(node) {
  window.hardening.allCategories[node.id] = node;
  const { id, name: text, children } = node; // Using 'name' as 'text' for display

  if (Array.isArray(children) && children.length > 0) {
     for (let i = 0; i < children.length; i += 1) {
        children[i] = treeMakeLegalNode(children[i]);
     }
  }
  return { id, text, children };
}

function treeProcessRawCategoryTreeResponse(categoryTreeStr, dataType) {
  if (dataType === 'json') {
    const categoryTree = JSON.parse(categoryTreeStr);
    for (let i = 0; i < categoryTree.length; i += 1) {
      categoryTree[i] = treeMakeLegalNode(categoryTree[i]);
    }
    return JSON.stringify(categoryTree);
  }
  return categoryTreeStr;
}

function handleTreeReady() {
  updateTaskCategorySelectByTreeChange();
}

function handleTreeSelectNode(event, selected) {
  const nodeId = selected.node.id;
  if (nodeId) {
    console.log("Selected category ID:", nodeId); // Debug ID
    window.hardening.selectedCategory.current = window.hardening.allCategories[nodeId] || { id: nodeId };

    // Gọi API lấy danh sách tasks
    ajaxGetTaskList(nodeId)
      .then((taskList) => {
        saveTaskList(taskList);
        renderTaskList(taskList);
      })
      .catch(handleError);
  } else {
    console.error("Node ID is undefined");
  }
}



function handleTreeCreateNode(node, parent, position) {
  updateTaskCategorySelectByTreeChange();
}

function handleTreeRenameNode(node, text, oldText) {
  updateTaskCategorySelectByTreeChange();
}

function handleTreeDeleteNode(node, parent) {
  updateTaskCategorySelectByTreeChange(); // Cập nhật danh sách category
  console.log(`Node deleted: ${node.id}, Parent: ${parent}`);
}


function handleTreeMoveNode(event, configuration) {
  const {node, parent: parentId, position} = configuration;
  const parent = (parentId === '#') ? null : parentId;
  ajaxUpdateCategory({id: node.id, parent, position}).then(() => {
    updateTaskCategorySelectByTreeChange();
  }, (jqXHR) => {
    handleError(jqXHR);
    const treeInstance = $('#category_tree').jstree(true);
    treeInstance.refresh();
  });
}

function handleTreeRefresh() {
  updateTaskCategorySelectByTreeChange();
}
window.hardening.selectedCategory = new Proxy({ current: { id: 1 } }, { set: handleSetSelectedCategory });

function handleSetSelectedCategory(obj, prop, value) {
  if (prop === 'current') {
      if (!value || !value.id) {
          console.error("Category ID is undefined. Selected category:", value);
          obj[prop] = { id: 1 }; // Gán ID mặc định là 1 khi không có category ID
          return true; // Dừng thực hiện nếu không có ID
      }

      const categoryId = value.id;
      console.log("Selected category ID:", categoryId);

      ajaxGetTaskList(categoryId).then((response) => {
          if (Array.isArray(response)) {
              window.hardening.selectedTask.current = null;
              saveTaskList(response);
              renderTaskList(response);
              renderCommandList([]);
          } else {
              console.error("Unexpected response format:", response);
          }
      }).catch(handleError);

      $('#task_new_button').css('display', categoryId ? 'block' : 'none');
  }

  obj[prop] = value;
  return true;
}



function handleGenerateCategorySlug(){
  let category_name = document.getElementById('category_name_input').value;
  let category_slug = category_name.replace(/[^\s-\w]/g, '').replace(/\s+/g, '-').toLowerCase()

  document.getElementById('category_slug_input').value = category_slug;
  window.hardening.categoryForm.slug = category_slug;
}

function handleSetCategoryForm(obj, prop, value) {
  switch (prop) {
    case 'show':
      $('#category_form').css('display', value ? 'block' : 'none');
      break;
    case 'mode':
      $('#category_form button[type="submit"]').text(value === 'edit' ? 'Update' : 'Create');
      break;
    case 'name':
      if (value !== obj.name) {
        $('#category_name_input').val(value);
      }
      break;
    case 'slug':
      if (value !== obj.slug) {
        $('#category_slug_input').val(value);
      }
      break;
    case 'cmd':
      if (value !== obj.cmd) {
        $('#category_cmd_input').val(value);
      }
      break;
    case 'expect_output':
      if (value !== obj.expect_output) {
        $('#category_expect_output_input').val(value);
      }
      break;
    case 'position':
      if (value !== obj.position) {
        $('#category_position_input').val(value);
      }
      break;
    default:
      break;
  }
  obj[prop] = value;
  return true;
}

function handleCategorySubmitForm(e) {
  e.preventDefault();
  if (window.hardening.categoryForm.mode === 'edit') {
    handleCategorySubmitUpdate();
  } else {
    handleCategorySubmitCreate();
  }
}

function handleCategorySubmitCreate() {
  const { parentNode, parent: parentId, position, name, slug, cmd, expect_output } = window.hardening.categoryForm;
  const parent = parentId === '#' ? null : parentId;
  const categoryForm = { parent, position, name, slug, cmd, expect_output };

  ajaxCreateCategory(categoryForm)
    .then((response) => {
      window.hardening.categoryForm.show = false;
      const treeInstance = $('#category_tree').jstree(true);

      // Làm mới cây để đồng bộ trạng thái
      treeInstance.refresh();
      alert('Category created successfully.');
    })
    .catch(handleError);
}

function handleCategorySubmitUpdate() {
  const {id, name, slug, cmd, expect_output} = window.hardening.categoryForm;
  const categoryForm = {id, name, slug, cmd, expect_output};
  ajaxUpdateCategory(categoryForm)
    .then((response) => {
      window.hardening.categoryForm.show = false;
      const treeInstance = $('#category_tree').jstree(true);
      treeInstance.refresh(); // Làm mới toàn bộ cây để đồng bộ lại trạng thái

      const updatedNodeData = treeMakeLegalNode(response);
      treeInstance.rename_node(updatedNodeData.id, updatedNodeData.text);
    })
    .catch(handleError);
}

function handleCategoryDelete(categoryId) {
  console.log(`Deleting category with ID: ${categoryId}`);

  ajaxDeleteCategory(categoryId)
    .then((response) => {
      console.log("Category deleted response:", response);

      // Lấy thông tin ID đã xóa và danh mục cha từ phản hồi
      const deletedId = response.deleted_id;
      const parentId = response.parent_id;

      const treeInstance = $('#category_tree').jstree(true);
      treeInstance.refresh(); // Làm mới toàn bộ cây để đồng bộ lại trạng thái

      // Xóa node đã xóa khỏi cây
      if (deletedId) {
        treeInstance.delete_node(deletedId);
      }

      // Làm mới cây nếu cần (tùy thuộc vào trường hợp cụ thể)
      if (parentId) {
        treeInstance.refresh_node(parentId); // Làm mới danh mục cha
      }

      alert('Category deleted successfully.');
    })
    .catch((error) => {
      console.error('Error deleting category:', error);
      alert(`Error deleting category: ${error.responseText}`);
    });
}



function flattenTreeCategory(node, level) {
  const {children, ...rest} = node;
  let result = [{...rest, level}];
  if (Array.isArray(children) && children.length > 0) {
    for (const child of children) {
      result = result.concat(flattenTreeCategory(child, level + 1));
    }
  }
  return result;
}


function ajaxGetTaskList(categoryId) {
  const token = localStorage.getItem('accessToken');
  if (!categoryId) {
    console.error("Category ID is undefined in ajaxGetTaskList. Current selected category:", window.hardening.selectedCategory);
    return Promise.reject("Category ID is undefined");
  }

  // Kiểm tra cẩn thận các điều kiện hoặc các lời gọi hàm bên trong, đảm bảo không có đệ quy
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://localhost:5000/api/categories/${categoryId}/tasks/`,
      method: 'GET',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: { withCredentials: true },
      dataType: 'json',
      success: (response) => {
        console.log("Task list response:", response);
        resolve(response);
      },
      error: (jqXHR) => {
        handleError(jqXHR);
        reject(jqXHR);
      }
    });
  });
}



function ajaxCreateTask(taskForm, categoryId) {
  const token = localStorage.getItem('accessToken');

  return new Promise((resolve, reject) => {
      $.ajax({
          url: `http://localhost:5000/api/categories/${categoryId}/tasks/`,  // Đảm bảo URL khớp với cấu trúc mới
          method: 'POST',
          headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
          xhrFields: {withCredentials: true},
          data: taskForm,
          dataType: 'json',
          success: resolve,
          error: reject,
      });
  });
}



function ajaxUpdateTask(taskForm, categoryId) {
  const { id, ...rest } = taskForm;
  const token = localStorage.getItem('accessToken');

  return new Promise((resolve, reject) => {
      $.ajax({
          url: `http://localhost:5000/api/categories/${categoryId}/tasks/${id}/`, // Đảm bảo URL này có categoryId
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
 },
          xhrFields: { withCredentials: true },
          data: { ...rest },
          dataType: 'json',
          success: resolve,
          error: reject,
      });
  });
}


function ajaxDeleteTask(taskId, categoryId) {
  const token = localStorage.getItem('accessToken');

  return new Promise((resolve, reject) => {
      $.ajax({
          url: `http://localhost:5000/api/categories/${categoryId}/tasks/${taskId}/`,
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
 },
          xhrFields: { withCredentials: true },
          success: resolve,
          error: reject,
      });
  });
}

function handleTaskCreateNew() {
  window.hardening.taskForm.show = true;
  window.hardening.taskForm.mode = 'create';
  window.hardening.taskForm.id = null;
  // Category value is supplied by selected category, no need to set it here
  window.hardening.taskForm.combine = 'And';
  window.hardening.taskForm.name = '';
  window.hardening.taskForm.scored = true;
  window.hardening.taskForm.remediation = '';
  window.hardening.taskForm.note = '';
}

function handleTaskSelect() {
  const taskId = $(this).attr('data-taskid');
  window.hardening.selectedTask.current = window.hardening.allTasks[taskId];
  $('.task').removeClass('active');
  $(this).toggleClass('active');
}

function handleTaskShowDetail(e) {
  e.stopPropagation();
  $(this).parents('.task').toggleClass('show');
}

function handleTaskEdit(e) {
  e.stopPropagation();
  const taskId = $(this).parents('.task').attr('data-taskid');
  const taskInEdit = window.hardening.allTasks[taskId];
  const selectedCategory = window.hardening.selectedCategory.current || {};
  const selectedCategoryId = selectedCategory.id;

  if (selectedCategoryId) {
      window.hardening.taskForm.show = true;
      window.hardening.taskForm.mode = 'edit';
      window.hardening.taskForm.id = taskId;
      window.hardening.taskForm.category = selectedCategoryId;
      window.hardening.taskForm.combine = taskInEdit.combine;
      window.hardening.taskForm.name = taskInEdit.name;
      window.hardening.taskForm.scored = taskInEdit.scored;
      window.hardening.taskForm.remediation = taskInEdit.remediation;
      window.hardening.taskForm.note = taskInEdit.note;
  } else {
      console.error("Selected category is not defined");
  }
}

function handleSetSelectedTask(obj, prop, value) {
  if (prop === 'current') {
    if (value && value.id) {
      const taskId = value.id;
      ajaxGetCommandList(taskId)
      .then((commandList) => {
        saveCommandList(commandList);
        renderCommandList(commandList);
      })
      .catch(handleError);
      $('#command_new_button').css('display', 'block');
    } else {
      $('#command_new_button').css('display', 'none');
    }
  }
  obj[prop] = value;
  return true;
}

function handleSetTaskForm(obj, prop, value) {
  switch (prop) {
    case 'show':
      $('#task_form').css('display', value ? 'block' : 'none');
      break;
    case 'mode':
      $('#task_form #task_category_input').parent().css('display', value === 'edit' ? 'block' : 'none');
      $('#task_form button[type="submit"]').text(value === 'edit' ? 'Update' : 'Create');
      break;
    case 'category':
      if (value !== obj.category) {
        $('#task_category_input').val(value);
      }
      break;
    case 'combine':
      if (value !== obj.combine) {
        $('#task_combine_input').val(value);
      }
      break;
    case 'name':
      if (value !== obj.name) {
        $('#task_name_input').val(value);
      }
      break;
    case 'scored':
      if (value !== obj.scored) {
        $('#task_scored_input').prop('checked', value);
      }
      break;
    case 'remediation':
      if (value !== obj.remediation) {
        $('#task_remediation_input').val(value);
      }
      break;
    case 'note':
      if (value !== obj.note) {
        $('#task_note_input').val(value);
      }
      break;
    default:
      break;
  }
  obj[prop] = value;
  return true;
}

function handleSetTaskLoading(obj, prop, value) {
  switch (prop) {
    case 'listLoading':
      if (value) {
        $('#task_loader').css('display', 'block');
      } else {
        $('#task_loader').css('display', 'none');
      }
      break;
    default:
      break;
  }
  obj[prop] = value;
  return true;
}

function handleTaskSubmitForm(e) {
  e.preventDefault();
  if (window.hardening.taskForm.mode === 'edit') {
    handleTaskSubmitUpdate();
  } else {
    handleTaskSubmitCreate();
  }
}

function handleTaskSubmitCreate() {
  const selectedCategory = window.hardening.selectedCategory.current || {};
  const selectedCategoryId = selectedCategory.id;

  if (selectedCategoryId) {
    const {combine, name, scored, remediation, note} = window.hardening.taskForm;
    const taskForm = {
      combine,
      name,
      scored,
      remediation,
      note
    };

    ajaxCreateTask(taskForm, selectedCategoryId)
      .then((newTask) => {
        window.hardening.taskForm.show = false;
        updateCommandTaskSelectByTasksChange();

        return ajaxGetTaskList(selectedCategoryId);
      })
      .then((taskList) => {
        if (Array.isArray(taskList)) {
          saveTaskList(taskList);
          renderTaskList(taskList);
          const newTask = taskList.find(task => task.name === name);
          if (newTask) {
            window.hardening.selectedTask.current = newTask;
            $(`.task[data-taskid="${newTask.id}"]`).trigger('click');
          }
        } else {
          console.error("Response does not contain a valid task array:", taskList);
        }
      })
      .catch(handleError);
  } else {
    console.error('Category ID is undefined');
    alert('Please select a category for the new task');
  }
}




function handleTaskSubmitUpdate() {
  const selectedCategory = window.hardening.selectedCategory.current || {};
  const selectedCategoryId = selectedCategory.id;

  const { id, combine, name, scored, remediation, note } = window.hardening.taskForm;
  const taskForm = { id, combine, name, scored, remediation, note };

  ajaxUpdateTask(taskForm, selectedCategoryId)
    .then(() => {
      window.hardening.taskForm.show = false;
      return ajaxGetTaskList(selectedCategoryId);
    })
    .then((taskList) => {
      saveTaskList(taskList);
      renderTaskList(taskList);
      alert('Task updated successfully.');
    })
    .catch(handleError);
}


function handleTaskDelete(e) {
  e.stopPropagation();
  const selectedCategory = window.hardening.selectedCategory.current || {};
  const selectedCategoryId = selectedCategory.id;
  const taskId = $(this).parents('.task').attr('data-taskid');

  if (selectedCategoryId) {
      ajaxDeleteTask(taskId, selectedCategoryId)
          .then(() => {
              window.hardening.taskForm.show = false;
              updateCommandTaskSelectByTasksChange();

              // Kiểm tra lại selectedCategory trước khi gọi ajaxGetTaskList
              if (selectedCategoryId) {
                  return ajaxGetTaskList(selectedCategoryId);
              } else {
                  console.error("Selected category ID is undefined after deletion");
                  return Promise.reject("Selected category ID is undefined");
              }
          })
          .then((taskList) => {
              if (Array.isArray(taskList)) {
                  const currentSelectedTask = window.hardening.selectedTask.current || {};
                  const currentSelectedTaskId = currentSelectedTask.id;
                  window.hardening.selectedTask.current = null;
                  saveTaskList(taskList);
                  renderTaskList(taskList);
                  if (String(taskId) === String(currentSelectedTaskId)) {
                      renderCommandList([]);
                  } else {
                      $(`.task[data-taskid="${currentSelectedTaskId}"]`).trigger('click');
                  }
              } else {
                  console.error("taskList is not an array:", taskList);
              }
          })
          .catch(handleError);
  } else {
      console.error("Selected category ID is undefined before deletion");
  }
}


function saveTaskList(taskList) {
  console.log("Received taskList:", taskList); // Xem dữ liệu trước khi lưu

  if (!Array.isArray(taskList)) {
    console.error("taskList is not an array:", taskList);
    return;
  }

  for (const task of taskList) {
    if (!task || typeof task.id === 'undefined') {
      console.error("Invalid task or task.id:", task);
      continue;
    }
    window.hardening.allTasks[task.id] = task;
  }
}


function renderTaskList(taskList) {
  if (!Array.isArray(taskList)) {
      console.error("taskList is not an array:", taskList);
      return;
  }

  const taskListHtml = taskList.map((task) => (`
      <div class="task" data-taskid="${safeHtmlEncode(task.id)}">
          <div class="font-weight-bold title">
              <span class="text">${safeHtmlEncode(task.name)}</span>
              <span class="control-list">
                  <span class="ml-2 control toggle-detail">
                      <i class="fa fa-eye"></i>
                  </span>
                  <span class="ml-2 control edit">
                      <i class="fa fa-edit"></i>
                  </span>
                  <span class="ml-3 control delete">
                      <i class="fa fa-trash"></i>
                  </span>
              </span>
          </div>
          <div class="detail">
              <div class="">
                  <span class="font-weight-bold">Command count:</span>
                  ${safeHtmlEncode(task.commands ? task.commands.length : 0)}
              </div>
              <div class="">
                  <span class="font-weight-bold">Remediation:</span>
                  ${safeHtmlEncode(task.remediation || '')}
              </div>
              <div class="">
                  <span class="font-weight-bold">Note:</span>
                  ${safeHtmlEncode(task.note || '')}
              </div>
          </div>
      </div>
  `)).join('');

  $('#task_list').empty();
  $('#task_list').html(taskListHtml);
}


function updateTaskCategorySelectByTreeChange() {
  const treeData = $('#category_tree').jstree(true).get_json('#', { flat: false });
  let flatTreeData = [];
  for (const rootNode of treeData) {
    flatTreeData = flatTreeData.concat(flattenTreeCategory(rootNode, 0));
  }
  const categorySelectHtml = flatTreeData.map((node) => (`
    <option value="${node.id}">
      ${(new Array(node.level)).fill('---&nbsp;').join('') + node.text}
    </option>
  `)).join('');
  $('#task_category_input').empty();
  $('#task_category_input').html(categorySelectHtml);
}


function ajaxGetCommandList(taskId) {
  const token = localStorage.getItem('accessToken');

  if (!taskId) {
     console.error("Task ID is undefined.");
     return Promise.reject("Task ID is undefined");
  }

  return new Promise((resolve, reject) => {
     $.ajax({
        url: `http://127.0.0.1:5000/api/tasks/${taskId}/commands/`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
 },
        xhrFields: { withCredentials: true },
        dataType: 'json',
        success: (response) => {
           console.log("Command list response:", response);

           if (Array.isArray(response)) {
              resolve(response); // If response is an array, pass it directly
           } else if (response && Array.isArray(response.results)) {
              resolve(response.results); // If response contains a "results" array, use it
           } else {
              console.error("Unexpected response format:", response);
              resolve([]); // Resolve with an empty array to avoid undefined errors
           }
        },
        error: reject,
     });
  });
}



function ajaxCreateCommand(commandForm, taskId) {
  const token = localStorage.getItem('accessToken');
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://127.0.0.1:5000/api/tasks/${taskId}/commands/`,  // Ensure taskId is provided here
      method: 'POST',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      data: commandForm,
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });
}


function ajaxUpdateCommand(commandForm) {
  const token = localStorage.getItem('accessToken');

  const {id, ...rest} = commandForm;
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://127.0.0.1:5000/api/commands/${id}/`,
      method: 'PATCH',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      data: {...rest},
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });
}

function ajaxDeleteCommand(commandId) {
  const token = localStorage.getItem('accessToken');

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `http://127.0.0.1:5000/api/commands/${commandId}/`,
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      success: resolve,
      error: reject,
    });
  });
}

function handleCommandCreateNew() {
  window.hardening.commandForm.show = true;
  window.hardening.commandForm.mode = 'create';
  window.hardening.commandForm.id = null;
  // Task value is supplied by selected task, no need to set it here
  window.hardening.commandForm.cmd = '';
  window.hardening.commandForm.expect = '';
  window.hardening.commandForm.operator = 'AllIn';
}

function handleSelectCommand() {
  $('.command').removeClass('active');
  $(this).toggleClass('active');
}

function handleCommandShowDetail(e) {
  e.stopPropagation();
  $(this).parents('.command').toggleClass('show');
}

function handleCommandEdit(e) {
  e.stopPropagation();
  const commandId = $(this).parents('.command').attr('data-commandid');
  const commandInEdit = window.hardening.allCommands[commandId];
  window.hardening.commandForm.show = true;
  window.hardening.commandForm.mode = 'edit';
  window.hardening.commandForm.id = commandId;
  window.hardening.commandForm.task = commandInEdit.task;
  window.hardening.commandForm.cmd = commandInEdit.cmd;
  window.hardening.commandForm.expect = commandInEdit.expect;
  window.hardening.commandForm.operator = commandInEdit.operator;
  window.hardening.commandForm.parser = commandInEdit.parser;
}

function handleSetCommandForm(obj, prop, value) {
  switch (prop) {
    case 'show':
      $('#command_form').css('display', value ? 'block' : 'none');
      break;
    case 'mode':
      $('#command_form #command_task_input').parent().css('display', value === 'edit' ? 'block' : 'none');
      $('#command_form button[type="submit"]').text(value === 'edit' ? 'Update' : 'Create');
      break;
    case 'task':
      if (value !== obj.task) {
        $('#command_task_input').val(value);
      }
      break;
    case 'cmd':
      if (value !== obj.cmd) {
        $('#command_cmd_input').val(value);
      }
      break;
    case 'expect':
      if (value !== obj.expect) {
        $('#command_expect_input').val(value);
      }
      break;
    case 'operator':
      if (value !== obj.operator) {
        $('#command_operator_input').val(value);
      }
      break;
    case 'parser':
      if (value !== obj.parser) {
        $('#command_parser_input').val(value);
      }
      break;
    default:
      break;
  }
  obj[prop] = value;
  return true;
}

function handleSetCommandLoading(obj, prop, value) {
  switch (prop) {
    case 'listLoading':
      if (value) {
        $('#command_loader').css('display', 'block');
      } else {
        $('#command_loader').css('display', 'none');
      }
      break;
    default:
      break;
  }
  obj[prop] = value;
  return true;
}

function handleCommandSubmitForm(e) {
  e.preventDefault();
  if (window.hardening.commandForm.mode === 'edit') {
    handleCommandSubmitUpdate();
  } else {
    handleCommandSubmitCreate();
  }
}

function handleCommandSubmitCreate() {
  const selectedTask = window.hardening.selectedTask.current || {};
  const selectedTaskId = selectedTask.id;
  
  if (selectedTaskId) {
    const {cmd, expect, operator} = window.hardening.commandForm;
    const commandForm = {cmd, expect, operator, task: selectedTaskId};
    
    ajaxCreateCommand(commandForm, selectedTaskId)
      .then(() => {
        window.hardening.commandForm.show = false;
        return ajaxGetCommandList(selectedTaskId);
      })
      .then((response) => {
        saveCommandList(response.results);
        renderCommandList(response.results);
      })
      .catch(handleError);
  } else {
    alert('Please select a task to which the new command will belong');
  }
}


function handleCommandSubmitUpdate() {
  const selectedTask = window.hardening.selectedTask.current || {};
  const selectedTaskId = selectedTask.id;

  const { id, cmd, expect, operator } = window.hardening.commandForm;
  const commandForm = { id, cmd, expect, operator };

  ajaxUpdateCommand(commandForm)
    .then(() => {
      window.hardening.commandForm.show = false;
      return ajaxGetCommandList(selectedTaskId);
    })
    .then((commandList) => {
      saveCommandList(commandList);
      renderCommandList(commandList);
      alert('Command updated successfully.');
    })
    .catch(handleError);
}

function handleCommandDelete(e) {
  e.stopPropagation();
  const selectedTask = window.hardening.selectedTask.current || {};
  const selectedTaskId = selectedTask.id;
  const commandId = $(this).parents('.command').attr('data-commandid');
  ajaxDeleteCommand(commandId)
    .then(() => {
      window.hardening.commandForm.show = false;
      return ajaxGetCommandList(selectedTaskId);
    })
    .then((response) => {
        saveCommandList(response.results);
        renderCommandList(response.results);
    })
    .catch(handleError);
}

function saveCommandList(commandList) {
  if (!Array.isArray(commandList)) {
      console.error("commandList is not an array:", commandList);
      return;
  }

  for (const command of commandList) {
      if (!command || typeof command.id === 'undefined') {
          console.error("Invalid command or command.id:", command);
          continue;
      }
      window.hardening.allCommands[command.id] = command;
  }
}


function renderCommandList(commandList) {
  if (!Array.isArray(commandList)) {
     console.error("commandList is not an array:", commandList);
     return;
  }

  const commandListHtml = commandList.map((command) => (`
     <div class="command" data-commandid="${safeHtmlEncode(command.id)}">
        <div class="font-weight-bold title">
           <span class="text">${safeHtmlEncode(command.cmd)}</span>
           <span class="control-list">
              <span class="ml-2 control edit">
                 <i class="fa fa-edit"></i>
              </span>
              <span class="ml-3 control delete">
                 <i class="fa fa-trash"></i>
              </span>
           </span>
        </div>
        <div class="detail">
           <div class="full-command">${safeHtmlEncode(command.cmd)}</div>
           <div class="">
              <span class="font-weight-bold">Operator:</span>
              ${safeHtmlEncode(command.operator)}
           </div>
           <div class="">
              <span class="font-weight-bold">Expect:</span>
              ${safeHtmlEncode(command.expect)}
           </div>
        </div>
     </div>
  `)).join('');

  $('#command_list').empty().html(commandListHtml);
}



function updateCommandTaskSelectByTasksChange() {
  ajaxGetTaskList(undefined).then((response) => {
    // Kiểm tra nếu response.results tồn tại và là mảng
    if (response && Array.isArray(response.results)) {
      const taskSelectHtml = response.results.map((task) => (`
        <option value="${task.id}">
          ${task.name}
        </option>
      `)).join('');

      $('#command_task_input').empty();
      $('#command_task_input').html(taskSelectHtml);
    } else {
      // Nếu response.results không hợp lệ, log lỗi và xử lý
      console.error("response.results is not defined or not an array:", response);
    }
  }).catch(handleError);  // Bắt lỗi nếu có lỗi từ ajaxGetTaskList
}



function handleError(jqXHR) {
  console.error(jqXHR);
  alert(`Error: ${jqXHR.responseText}`);
}


$(document).ready(function() {
  const token = localStorage.getItem('accessToken');
  window.hardening.selectedCategory.current = window.hardening.selectedCategory.current || { id: 1 };
  handleSetSelectedCategory(window.hardening.selectedCategory, 'current', window.hardening.selectedCategory.current);
  $('table.administration').colResizable({
    liveDrag: true,
    minWidth: 132,
  });

	$('#category_tree').jstree({
		core : {
      themes: {
        theme: 'default-dark',
        url: '../static/css/plugins/jstree/themes/default-dark/style.min.css',
        dots: true,
        icons: false,
      },
      data : {
        url: 'http://localhost:5000/api/categories/',
        method: 'GET',
        headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
        xhrFields: {withCredentials: true},
        dataFilter: treeProcessRawCategoryTreeResponse, // Ensure dataFilter processes nested structure
        dataType: 'json',
      },
      check_callback: treeCheckCallback,
		},
    contextmenu: {
      items: () => {
        const createchild = {
					separator_before: false,
					separator_after: false,
					_disabled: false,
					label: "New Child",
					action: treeCreateChildAction,
				};
        const createsibling = {
					separator_before: false,
					separator_after: true,
					_disabled: false,
					label: "New Sibling",
					action: treeCreateSiblingAction,
				};
        const editnode = {
					separator_before: false,
					separator_after: false,
					_disabled: false,
					label: "Edit",
					action: treeEditNodeAction,
        };
        const deletenode = {
					separator_before: false,
					separator_after: false,
					_disabled: false,
					label: "Delete",
					action: treeDeleteNodeAction,
        }
        return {createchild, createsibling, editnode, deletenode};
      },
    },
    plugins: ['dnd', 'contextmenu'],
	});

	$('#category_tree').on('ready.jstree', handleTreeReady);
	$('#category_tree').on('select_node.jstree', handleTreeSelectNode);
	$('#category_tree').on('create_node.jstree', handleTreeCreateNode);
	$('#category_tree').on('rename_node.jstree', handleTreeRenameNode);
	$('#category_tree').on('delete_node.jstree', handleTreeDeleteNode);
	$('#category_tree').on('move_node.jstree', handleTreeMoveNode);
	$('#category_tree').on('refresh.jstree', handleTreeRefresh);
	$('#category_tree').jstree('set_theme', 'default-dark');

  $('#category_form').css('display', 'none');
  $('#category_form').on('click', '.close', function() {
    window.hardening.categoryForm.show = false;
  });
  $('#category_form #category_name_input').on('change', function() {
    window.hardening.categoryForm.name = $(this).val();
  });
  $('#category_form #category_slug_input').on('change', function() {
    window.hardening.categoryForm.slug = $(this).val();
  });
  $('#category_form #category_cmd_input').on('change', function() {
    window.hardening.categoryForm.cmd = $(this).val();
  });
  $('#category_form #category_expect_output_input').on('change', function() {
    window.hardening.categoryForm.expect_output = $(this).val();
  });
  $('#category_form form').on('submit', handleCategorySubmitForm);


  $('#task_new_button').css('display', 'none');
  $('#task_new_button').on('click', handleTaskCreateNew);

  $('#task_loader').css('display', 'none');

  $('#task_list').on('click', '.task', handleTaskSelect);
  $('#task_list').on('click', '.toggle-detail', handleTaskShowDetail);
  $('#task_list').on('click', '.edit', handleTaskEdit);
  $('#task_list').on('click', '.delete', handleTaskDelete);

  $('#task_form').css('display', 'none');
  $('#task_form').on('click', '.close', function() {
    window.hardening.taskForm.show = false;
  });
  $('#task_form #task_category_input').on('change', function() {
    window.hardening.taskForm.category = $(this).val();
  });
  $('#task_form #task_combine_input').on('change', function() {
    window.hardening.taskForm.combine = $(this).val();
  });
  $('#task_form #task_name_input').on('change', function() {
    window.hardening.taskForm.name = $(this).val();
  });
  $('#task_form #task_scored_input').on('change', function() {
    window.hardening.taskForm.scored = $(this).prop('checked');
  });
  $('#task_form #task_remediation_input').on('change', function() {
    window.hardening.taskForm.remediation = $(this).val();
  });
  $('#task_form #task_note_input').on('change', function() {
    window.hardening.taskForm.note = $(this).val();
  });
  $('#task_form form').on('submit', handleTaskSubmitForm);


  $('#command_new_button').css('display', 'none');
  $('#command_new_button').on('click', handleCommandCreateNew);

  $('#command_loader').css('display', 'none');

  $('#command_list').on('click', '.command', handleSelectCommand);
  $('#command_list').on('click', '.title', handleCommandShowDetail);
  $('#command_list').on('click', '.edit', handleCommandEdit);
  $('#command_list').on('click', '.delete', handleCommandDelete);

  $('#command_form').css('display', 'none');
  $('#command_form').on('click', '.close', () => {
    window.hardening.commandForm.show = false;
  });
  $('#command_form #command_task_input').on('change', function() {
    window.hardening.commandForm.task = $(this).val();
  });
  $('#command_form #command_cmd_input').on('change', function() {
    window.hardening.commandForm.cmd = $(this).val();
  });
  $('#command_form #command_expect_input').on('change', function() {
    window.hardening.commandForm.expect = $(this).val();
  });
  $('#command_form #command_operator_input').on('change', function() {
    window.hardening.commandForm.operator = $(this).val();
  });
  $('#command_form #command_parser_input').on('change', function(){
    window.hardening.commandForm.parser = $(this).val();
  });
  $('#command_form form').on('submit', handleCommandSubmitForm);

  updateCommandTaskSelectByTasksChange();
});