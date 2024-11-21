let csrf_token = '{% csrf_token %}'
window.homepage = {};

function refreshTokenIfExpired() {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!token || !refreshToken || isTokenExpired(token)) {
      if (!refreshToken) {
          alert("Refresh token không tồn tại. Vui lòng đăng nhập lại.");
          window.location.href = 'http://127.0.0.1:8000/accounts/login.html';
          return;
      }

      fetch('http://localhost:5000/api/token/refresh/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
      })
      .then(response => {
          if (!response.ok) {
              throw new Error("Token làm mới không hợp lệ hoặc đã hết hạn.");
          }
          return response.json();
      })
      .then(data => {
          if (data.access) {
              localStorage.setItem('accessToken', data.access);
          } else {
              throw new Error("Làm mới token thất bại.");
          }
      })
      .catch(error => {
          console.error('Lỗi làm mới token:', error);
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = 'http://127.0.0.1:8000/accounts/login.html';
      });
  }
}
function setTokens(accessToken, refreshToken) {
  if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
  }
}


// Hàm kiểm tra token có hết hạn hay không
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính bằng giây
  return payload.exp < currentTime;
}


function ajaxGetProjectList(){
  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('Token không tồn tại. Vui lòng đăng nhập lại.');
    window.location.href = 'http://127.0.0.1:8000/accounts/login.html';  // Chuyển hướng đến trang đăng nhập nếu không có token
    return;
  }

  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://localhost:5000/api/projects/',  // Thay đổi đường dẫn cổng 5000
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ

      },
      xhrFields: { withCredentials: true },
      dataType: 'json',
      success: resolve,
      error: reject,
    });
  });
}


function ajaxGetResultList(projectId){
  const token = localStorage.getItem('accessToken');
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://localhost:5000/api/results/',  // Thay đổi đường dẫn cổng 5000
      method: 'GET',
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      xhrFields: {withCredentials: true},
      data: {
        project_id: projectId,
      },
      dataType: 'json',
      success: resolve,
      error: reject,
    })
  })
}

  function renderProjectList(projectList) {
    projectList.push({
      id: '',
      name: 'All'
    })
    let projectListHtml = projectList.map((project) => (`
      <div class="sidebar" data-projectid="${project.id}">
      <div class="font-weight-bold title">
        <span class="text">${project.name}</span>
        <span class="control-list">
          <!--<span class="ml-2 control toggle-detail">
            <i class="fa fa-eye"></i>
          </span>-->
          <span class="ml-2 control edit">
            <i class="fa fa-edit" onclick="openEditProject(${project.id})"></i>
          </span>
          <span class="ml-3 control delete">
            <i class="fa fa-trash" onclick="openDeleteProjectConfirmModal(${project.id})"></i>
          </span>
        </span>
      </div>
      </div>
    </div>
    `)).join('');
    $('#sidebar_list').empty();
    $('#sidebar_list').html(projectListHtml);
  }

  function getProjectList() {
    ajaxGetProjectList().then((response) => {
      renderProjectList(response);
    }, handleError)
  }

  function handleProjectSelect(){
    let projectId = $(this).attr('data-projectid');
    window.homepage.currentProjectId = projectId;
    if (window.homepage.tableInstance) {
      window.homepage.tableInstance.ajax.reload();
    }
  }

  function openDeleteProjectConfirmModal(project_id){
    $("#confirmModal").modal('show')
    document.getElementById("confirmModalLabel").innerHTML = 'Delete Confirmation'
    document.getElementById("confirmModalBody").innerHTML = 'Are you sure want to delete?'
    document.getElementById("confirmModalButton").innerHTML = 'Yes, Delete'
    document.getElementById("confirmModalButton").setAttribute("onClick", `deleteProject(${project_id})`)
  }

  function deleteProject(project_id){
    const token = localStorage.getItem('accessToken');
    $("#confirmModal").modal('hide')
    $.ajax({
      type: 'DELETE',
      url: `http://localhost:5000/api/projects/${project_id}/`,  // Thay đổi đường dẫn cổng 5000
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      success: function (data){
        getProjectList()
      }
    })
  }

  function openEditProject(project_id){
    $.ajax({
      type: 'GET',
      url: `http://localhost:5000/api/projects/${project_id}/common/`,  // Thay đổi đường dẫn cổng 5000
      success: function (data) {
        document.getElementById('project-id').value = data.id
        document.getElementById('project-creator').value = data.creator
        document.getElementById('project-name-edit').value = data.name
        document.getElementById('project-created').value = data.created
        $('#editProjectModal').modal({
          show: true,
        })
      }
    })
  }
  function editProject(){
    const token = localStorage.getItem('accessToken');
    let project_id = document.getElementById('project-id').value
    let data = {
      'name': document.getElementById('project-name-edit').value
    }
    $.ajax({
      type: 'PATCH',
      url: `http://localhost:5000/api/projects/${project_id}/`,
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      data: data,
      success: function () {
        $('#editProjectModal').modal('hide');
        /*
        if (window.homepage.tableInstance) {
          window.homepage.tableInstance.ajax.reload();
        }
        */
        getProjectList()
      }
    })
  }

  function getProject(selected=null){
    const token = localStorage.getItem('accessToken');

      $.ajax({
      type: 'GET',
      url: `http://localhost:5000/api/projects/`,
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      success: function (data) {
        let select = document.getElementById('result-project')
        let len = select.options.length
        for (let i = len-1; i >= 2; i--) {
          select.options[i] = null;
        }
        for (let i = 0; i < data.length; i++) {
          let option_obj = document.createElement('option')
          option_obj.text = data[i].name
          option_obj.value = data[i].id
          select.options[2+i] = option_obj
        }
        if(selected)
          select.value = selected
      }
    })
  }

  function editResult() {
    const token = localStorage.getItem('accessToken');
    let result_id = document.getElementById('result-id').value;
    let data = {
        name: document.getElementById('result-name').value,
        project: document.getElementById('result-project').value,
    };

    $.ajax({
        type: 'PATCH',
        url: `http://localhost:5000/api/results/edit/${result_id}/`, // API chỉnh sửa
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
 },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function () {
            $('#editResultModal').modal('hide');
            window.homepage.tableInstance.ajax.reload(); // Reload bảng
        },
        error: function (xhr) {
            alert(`Error: ${xhr.responseText}`);
        }
    });
}


  function editResult(){
    const token = localStorage.getItem('accessToken');
    let result_id = document.getElementById('result-id').value
    let data = {
      'project': document.getElementById('result-project').value
    }
    $.ajax({
      type: 'PATCH',
      url: `http://localhost:5000/api/results/${result_id}/`,
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      data: data,
      success: function () {
        $('#editResultModal').modal('hide');
        if (window.homepage.tableInstance) {
          window.homepage.tableInstance.ajax.reload();
          getProjectList()
        }
      }
    })
  }

  function changeOs() {
    let os = $('input[name=os]:checked').val();
    document.getElementById('agent-download').href = `http://localhost:5000/api/agent/download/?os=${os}`; // Đường dẫn tải xuống

    // Cập nhật action cho form upload
    try {
        document.getElementById('uploadFile').action = `http://localhost:5000/api/agent/upload/?os=${os}`;
    } catch {}

    // Gọi API để lấy SHA256
    $.ajax({
        type: 'GET',
        url: `http://localhost:5000/api/agent/sha/?os=${os}`, // Sửa lại dấu nháy
        success: function (data) {
            document.getElementById('sha-agent').innerHTML = `SHA256: ${data['sha256']}`;
        },
        error: function (xhr) {
            console.error('Error:', xhr);
            alert('Error: ' + xhr.responseText);
        }
    });
}

  function showCreateNewProject(event){
    if (event.target.value === 'NEW'){
      $('#createProjectModal').modal({
        show: true
      })
      document.getElementById('result-project').value = ''
    }
  }

  function createNewProject(){
    const token = localStorage.getItem('accessToken');
    let data = {
      'name': document.getElementById('project-name').value,
      'status': 'True'
    }
    $.ajax({
      type: 'POST',
      url: `http://localhost:5000/api/projects/`,
      headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
},
      data: data,
      success: function (data){
        getProject(data.id)
        $('#createProjectModal').modal('hide')
      }
    })
  }

  function openDeleteConfirmModal(result_id){
    $("#confirmModal").modal('show')
    document.getElementById("confirmModalLabel").innerHTML = 'Delete Confirmation'
    document.getElementById("confirmModalBody").innerHTML = 'Are you sure want to delete?'
    document.getElementById("confirmModalButton").innerHTML = 'Yes, Delete'
    document.getElementById("confirmModalButton").setAttribute("onClick", `deleteResult(${result_id})`)
  }
  function deleteResult(result_id) {
    const token = localStorage.getItem('accessToken');
    $.ajax({
        type: 'DELETE',
        url: `http://localhost:5000/api/results/delete/`,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
 },
        data: JSON.stringify({ id: result_id }),
        contentType: 'application/json',
        success: function () {
            window.homepage.tableInstance.ajax.reload(); // Reload bảng
        },
        error: function (xhr) {
            alert(`Error: ${xhr.responseText}`);
        }
    });
}


function downloadReport(result_id, file_type, only_score) {
  const token = localStorage.getItem('accessToken'); // Lấy token từ localStorage
  const url = `http://localhost:5000/results/download/?id=${result_id}&type=${file_type}&only_score=${only_score}`;

  // Sử dụng fetch để thêm header Authorization
  fetch(url, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Đảm bảo token hợp lệ
 // Thêm token Authorization
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error("Tải xuống thất bại, kiểm tra xác thực hoặc dữ liệu");
      }

      // Lấy header Content-Disposition để lấy tên file (nếu server gửi)
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `file.${file_type}`;
      if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match.length > 1) {
              filename = match[1];
          }
      }

      return response.blob().then(blob => ({ blob, filename }));
  })
  .then(({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // Sử dụng tên file lấy từ server
      document.body.appendChild(link);
      link.click();
      link.remove();
  })
  .catch(error => {
      console.error('Error downloading the file:', error);
      alert('Tải xuống thất bại: ' + error.message);
  });
}



  function handleError(jqXHR) {
    console.error(jqXHR);
    alert(`Error: ${jqXHR.responseText}`);
  }

  $(document).ready(function (){

    $('table.table-dual').colResizable({
      liveDrag: true,
      minWidth: 132,
    });
    /*
    ajaxGetProjectList().then((response) => {
      renderProjectList(response);
    }, handleError)
    */
    getProjectList()
    window.homepage.tableInstance = $(document).ready(function () {
      window.homepage.tableInstance = $('#detailsTable').DataTable({
          ajax: {
              url: 'http://localhost:5000/api/results/', // Đường dẫn API trả về danh sách kết quả
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Thêm token xác thực
              },
              dataSrc: '' // Nếu API trả về danh sách JSON trực tiếp
          },
          columns: [
              { data: 'created', title: 'Created' }, // Cột "Created"
              { data: 'name', title: 'Name' },       // Cột "Name"
              { 
                  data: 'project.name', 
                  title: 'Project', 
                  defaultContent: '' // Đặt giá trị mặc định nếu thiếu dữ liệu
              },
              { data: 'creator', title: 'Creator' },
              { 
                  data: null, 
                  title: 'Docx Actions', 
                  render: function (data, type, row) {
                      return `
                          <div class="dropdown">
                              <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  <i class="fa fa-download"></i> Docx
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                  <button class="btn" onclick="downloadReport(${row.id}, 'docx', true)">Scored Tasks</button>
                                  <button class="btn" onclick="downloadReport(${row.id}, 'docx', false)">All Tasks</button>
                              </div>
                          </div>`;
                  }
              },
              { 
                  data: null, 
                  title: 'HTML Actions', 
                  render: function (data, type, row) {
                      return `
                          <div class="dropdown">
                              <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  <i class="fa fa-download"></i> HTML
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                  <button class="btn" onclick="downloadReport(${row.id}, 'html', true)">Scored Tasks</button>
                                  <button class="btn" onclick="downloadReport(${row.id}, 'html', false)">All Tasks</button>
                              </div>
                          </div>`;
                  }
              },
              { 
                  data: null, 
                  title: 'Edit', 
                  render: function (data, type, row) {
                      return `<i class="btn fa fa-edit" onclick="openEditResult(${row.id})"></i>`;
                  }
              },
              { 
                  data: null, 
                  title: 'Delete', 
                  render: function (data, type, row) {
                      return `<i class="btn fa fa-trash" onclick="openDeleteConfirmModal(${row.id})"></i>`;
                  }
              }
          ],
          order: [[0, 'desc']], // Sắp xếp theo cột "Created" giảm dần
          serverSide: true,     // Kích hoạt server-side processing nếu cần
          processing: true      // Hiển thị biểu tượng tải khi đang load dữ liệu
      });
  
      // Gắn sự kiện chọn dự án
      $('#sidebar_list').on('click', '.sidebar', handleProjectSelect);
  
      // Kích hoạt lại sự kiện resize sau khi DOM tải xong
      setTimeout(() => {
          $(window).trigger('resize');
      }, 0);
  });
  });
  function checkToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("Token không tồn tại hoặc hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = 'http://127.0.0.1:8000/accounts\login.html';  // Chuyển hướng đến trang đăng nhập
    }
  }
  