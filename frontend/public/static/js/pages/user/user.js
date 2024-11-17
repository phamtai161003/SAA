function handleError(jqXHR) {
  console.error(jqXHR);
  alert(`Error: ${jqXHR.responseText}`);
}

function ajaxGetGroupUser() {
    const token = localStorage.getItem('accessToken');

  return new Promise((resolve, reject) => {
      $.ajax({
          url: 'http://localhost:5000/api/groups',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          xhrFields: { withCredentials: true },
          dataType: 'json',
          success: resolve,
          error: reject,
      })
  });
}

function getGroupUser() {
  ajaxGetGroupUser().then((response) => {
      renderGroupList(response);
  }).catch(handleError);
}

function renderGroupList(groupUser) {
  groupUser.push({
      id: '',
      name: 'All'
  });

  let groupUserHtml = groupUser.map((group) => `
      <div class="sidebar" data-groupid="${group.id}">
          <div class="font-weight-bold title">
              <span class="text">${group.name}</span>
              <span class="control-list">
                  <span class="ml-2 control edit">
                      <i class="fa fa-edit" onclick="openEditGroup(${group.id})"></i>
                  </span>
                  <span class="ml-2 control create">
                      <i class="fa fa-plus" onclick="openCreateUser(${group.id})"></i>
                  </span>
              </span>
          </div>
      </div>
  `).join('');

  $('#sidebar_list').empty().html(groupUserHtml);
}

$(document).ready(function () {
  getGroupUser();
  const token = localStorage.getItem('accessToken');

  window.detailsTable = $('#detailsTable').DataTable({
    ajax: function (data, callback, settings) {
        const token = localStorage.getItem('accessToken');
        $.ajax({
            url: 'http://localhost:5000/api/users/',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (response) {
                callback({ data: response.data });
            },
            error: function (error) {
                console.error("Error fetching users:", error);
                alert('Failed to load users.');
            }
        });
    },
    columns: [
        { data: 'date_joined' },
        { data: 'username' },
        { data: 'is_staff' },
        { data: 'is_active' },
        { data: 'last_login' },
        { data: 'crypto_key' },
        {
            render: function (data, type, row) {
                return `<i class="btn fa fa-edit" onclick="openEditUser(${row.id})"></i>`;
            }
        }
    ],
    order: [[0, 'desc']]
});

  $('#sidebar_list').on('click', '.sidebar', handleProjectSelect);
});

function openEditGroup(group_id) {
  $.ajax({
      type: 'GET',
      url: `http://localhost:5000/api/groups/${group_id}/common/`,
      success: function (data) {
          document.getElementById('group-id').value = data.id;
          document.getElementById('group-name').value = data.name;
          $('#editGroupModal').modal({ show: true });
      },
      error: handleError
  });
}

function editGroup() {
    const token = localStorage.getItem('accessToken');

  let group_id = document.getElementById('group-id').value;
  let data = {
      'name': document.getElementById('group-name').value
  };
  $.ajax({
      type: 'PATCH',
      url: `http://localhost:5000/api/groups/${group_id}/`,
      headers: { 'Authorization': `Bearer ${token}` },
      data: data,
      success: function () {
          $('#editGroupModal').modal('hide');
          getGroupUser();
      },
      error: handleError
  });
}

function showCreateNewGroup() {
  document.getElementById('group-name-add').value = '';
  $('#createGroupModal').modal({ show: true });
}

function createNewGroup() {
    const token = localStorage.getItem('accessToken');

  let data = {
      'name': document.getElementById('group-name-add').value
  };
  $.ajax({
      type: 'POST',
      url: `http://localhost:5000/api/groups/`,
      headers: { 'Authorization': `Bearer ${token}` },
      data: data,
      success: function () {
          getGroupUser();
          $('#createGroupModal').modal('hide');
      },
      error: handleError
  });
}

function openEditUser(user_id) {
  $.ajax({
      type: 'GET',
      url: `http://localhost:5000/api/users/${user_id}/common/`,
      success: function (data) {
          document.getElementById('user-id').value = data.id;
          document.getElementById('user-name').value = data.username;
          document.getElementById('user-email').value = data.email;
          document.getElementById('user-is-staff').checked = data.is_staff;
          document.getElementById('user-is-active').checked = data.is_active;
          $('#editUserModal').modal({ show: true });
      },
      error: handleError
  });
}

function editUser() {
    const token = localStorage.getItem('accessToken');

  let user_id = document.getElementById('user-id').value;
  let data = {
      'username': document.getElementById('user-name').value,
      'email': document.getElementById('user-email').value,
      'is_staff': document.getElementById('user-is-staff').checked,
      'is_active': document.getElementById('user-is-active').checked
  };
  $.ajax({
      type: 'PATCH',
      url: `http://localhost:5000/api/users/${user_id}/`,
      headers: { 'Authorization': `Bearer ${token}` },
      data: data,
      success: function () {
          $('#editUserModal').modal('hide');
          window.detailsTable.ajax.reload();
      },
      error: handleError
  });
}

function openCreateUser(group_id) {
  document.getElementById('user-name-add').value = '';
  document.getElementById('user-pass-add').value = '';
  document.getElementById('user-pass-confirm').value = '';
  document.getElementById('user-email-add').value = '';
  document.getElementById('user-is-staff-add').checked = false;
  document.getElementById('user-is-active-add').checked = true;
  $('#createUserModal').modal({ show: true });
}

function createUser() {
    const token = localStorage.getItem('accessToken');

  let password = document.getElementById('user-pass-add').value;
  let confirmpass = document.getElementById('user-pass-confirm').value;
  if (password !== confirmpass) {
      alert('Passwords do not match');
      return;
  }

  let data = {
      'groups': window.detailsTable.currentGroupId,
      'username': document.getElementById('user-name-add').value,
      'password': password,
      'email': document.getElementById('user-email-add').value,
      'is_staff': document.getElementById('user-is-staff-add').checked,
      'is_active': document.getElementById('user-is-active-add').checked
  };

  $.ajax({
      type: 'POST',
      url: `http://localhost:5000/api/users/`,
      headers: { 'Authorization': `Bearer ${token}` },
      data: data,
      success: function () {
          window.detailsTable.ajax.reload();
          $('#createUserModal').modal('hide');
      },
      error: handleError
  });
}

function handleProjectSelect() {
  let groupId = $(this).attr('data-groupid');
  window.detailsTable.currentGroupId = groupId;
  window.detailsTable.ajax.reload();
}
