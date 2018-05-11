var baseApi = 'http://dhc.blo.com.vn/';
$(document).ready(function () {
    $('body').on('click', '.btn-upload', function () {
        var numberImg = $('.selectImg').length;
        if(numberImg < 3) {
            $('#imgUpload').click();
        } else {
            alert('Không chọn quá 3 ảnh');
        }
    });

    /*Add point button*/
    $('.add-form-point').click(function () {

        /*Reset value empty*/
        $('#pointForm .pointForm').val('');

        /*Show button upload and button add*/
        $('.btn-upload').show();
        $('#addPoint').show();

        /*Hide edit point*/
        $('#editPoint').hide();

        /*Remove all image preview of point detail or edit point*/
        $('.img-preview').remove();

        /*Enable form input*/
        $('#pointForm .form-control').prop('disabled', false);
    });

    /*Add Point*/
    $('body').on('click', '#addPoint', function () {
        var arr = [];
        $.each($('.selectImg'),function (k, v) {
            arr.push(v.currentSrc);
        });
        var stringImage = JSON.stringify(arr);
        $.ajax({
            type: 'POST',
            url: baseApi + 'point/add-point',
            dataType: 'json',
            data: JSON.stringify({
                point_name: $('#pointName').val(),
                point_type: $('#pointType').val(),
                lat: $('#pointLat').val(),
                long: $('#pointLong').val(),
                point_detail: $('#pointDetail').val(),
                point_note: $('#pointNote').val(),
                point_images: stringImage
            }),
            success: function () {
                $('#modalForm').modal('hide');
                getListPoint();
            },
            error: function () {
                alert('Có lỗi');
            }
        });
    });

    /*Get list point*/
    $('#tab2').change(function () {
        getListPoint();

        /*Build form point*/
        buildFormPoint();

        $('#imgUpload').change(function(){
            if($(this).val() !== '')
            {
                UploadImage();
            }
        });

        $.ajax({
            type: 'POST',
            url: baseApi + 'type/get-type',
            dataType: 'json',
            data: JSON.stringify({
                type_of: 2,
            }),
            success: function (result) {
                $('#pointType').html('');
                $.each(result.data.result, function (k, v) {
                    $('#pointType').append('<option value="' + v.type_id + '">' + v.type_name + '</option>');
                });
            },
            error: function () {
                alert('Có lỗi');
            }
        });
    });

    /*Event delete point*/
    $('body').on('click', '.delete-point', function () {
        var pointId = $(this).data('id');
        $.confirm({
            title: 'Xác nhận',
            content: 'Bạn chắc chắn muốn xóa ?',
            buttons: {
                confirm: {
                    text: 'Xác nhận',
                    btnClass: 'btn-danger',
                    action: function () {
                        $.ajax({
                            type: 'POST',
                            url: baseApi + 'point/delete-point',
                            dataType: 'json',
                            data: JSON.stringify({
                                point_id: pointId
                            }),
                            success: function () {
                                getListPoint();
                            },
                            error: function () {
                                alert('Có lỗi');
                            }
                        });
                    }
                },
                cancel: {
                    text: 'Hủy'
                }
            }
        });
    });

    /*Event view detail*/
    $('body').on('click', '.view-point', function () {
        var pointId = $(this).data('id');
        /*Remove all image preview of point detail or edit point*/
        $('.img-preview').remove();

        getListPointById(pointId);

        /*Disabled form input*/
        $('#pointForm .form-control').prop('disabled', true);

        /*Hide button upload*/
        $('.btn-upload').hide();

        /*Hide button accept*/
        $('.btn-upload').hide();
        $('#addPoint').hide();
    });

    /*Event remove image preview*/
    $('body').on('click', '.remove-img', function () {
        $(this).parent('.img-preview').remove();
    });
});

/*Upload image ajax*/
function UploadImage() {
    var form = new FormData($("#pointForm")[0]);
    $.ajax({
        type: 'POST',
        url: baseApi + 'point/upload-image',
        data: form,
        processData: false,
        contentType: false,
        cache: false,
        success: function (data) {
            var previewImg = '<div class="col-3 img-preview">';
            previewImg += '<button class="close remove-img" type="button">×</button>';
            previewImg += '<img src="' + data.data.result + '" class="img-thumbnail selectImg" alt="Preview">';
            previewImg += '</div>';
            $('.prepend-img').prepend(previewImg);
        }
    });
}

/*Get list point ajax*/
function getListPoint() {
    $('#point').html('');
    $.ajax({
        url: baseApi + 'point/get-all-point',
        method: 'POST',
        dataType: 'json',
        success: function (result) {
            pointData = result.data.results;
            var index = 1;
            $.each(pointData, function (k, v) {
                html = '<tr>';
                html += '<th scope="row">' + index + '</th>';
                html += '<td>' + v.point_name + '</td>';
                html += '<td>' + v.pointType.type_name + '</td>';
                html += '<td>' + v.lat + ',' + v.long + '</td>';
                if(v.point_note == null) {
                    html += '<td>-</td>';
                } else {
                    html += '<td>' + v.point_note + '</td>';
                }
                html += '<td><div class="dropdown">';
                html += '<a class="dropdown-toggle menu" data-toggle="dropdown" aria-haspopup="true"\n' +
                    'aria-expanded="false">';
                html += '<i class="fas fa-ellipsis-v"></i></a>';
                html += '<div class="dropdown-menu">';
                html += '<button class="dropdown-item view-point" data-id="' + v.point_id + '" href="#">Chi tiết</button>';
                html += '<button class="dropdown-item edit-point" data-id="' + v.point_id + '" href="#">Sửa</button>';
                html += '<button class="dropdown-item delete-point" data-id="' + v.point_id + '" href="#">Xóa</button>';
                html += '</div>';
                html += '</div></td>';
                html += '</tr>';
                $('#point').append(html);
                index++;
            });
        },
        error: function (e) {
            alert('Có lỗi');
        }
    });
}

/*Get list point by id ajax*/
function getListPointById(id){
    $.ajax({
        url: baseApi + 'point/get-point',
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            point_id: id
        }),
        success: function (result) {
            $('#modalForm').modal('show');
            var pointData = result.data.result;
            $('#pointName').val(pointData.point_name);
            $('#pointType').val(pointData.point_type).change();
            $('#pointLat').val(pointData.lat);
            $('#pointLong').val(pointData.long);
            if(pointData.point_detail !== null) {
                $('#pointDetail').val(pointData.point_detail);
            }

            if(pointData.point_note !== null) {
                $('#pointNote').val(pointData.point_note);
            }

            if(pointData.point_images !== '') {
                var pointImage = JSON.parse(pointData.point_images);

                for(i = 0; i < pointImage.length; i++) {
                    var previewImg = '<div class="col-3 img-preview">';
                    previewImg += '<img src="' + pointImage[i] + '" class="img-thumbnail selectImg" alt="Preview">';
                    previewImg += '</div>';
                    $('.prepend-img').prepend(previewImg);
                }
            }
        },
        error: function (e) {
            alert('Có lỗi');
        }
    });
}

/*Build form point*/
function buildFormPoint() {
    $('#form-body').html('');
    $('#form-footer').html('');

    /*Build form body*/
    var formBodyHtml = '<form action="#" id="pointForm">';
            formBodyHtml += '<div class="row">';
                formBodyHtml += '<div class="col-12 col-md-6">';
                    formBodyHtml += '<div class="form-group">';
                        formBodyHtml += '<label for="pointName">Tên địa điểm</label>';
                        formBodyHtml += '<input type="text" class="form-control pointForm" id="pointName" placeholder="Tên địa điểm">';
                    formBodyHtml += '</div>';
                formBodyHtml += '</div>';
                formBodyHtml += '<div class="col-12 col-md-6">';
                    formBodyHtml += '<div class="form-group">';
                        formBodyHtml += '<label for="pointType">Loại</label>';
                        formBodyHtml += '<select class="form-control" id="pointType"></select>';
                    formBodyHtml += '</div>';
                formBodyHtml += '</div>';
                formBodyHtml += '<div class="col-12">';
                    formBodyHtml += '<div class="form-group">';
                        formBodyHtml += '<label for="pointLat">Tọa độ</label>';
                        formBodyHtml += '<div class="row">';
                            formBodyHtml += '<div class="col-12 col-md-6">';
                                formBodyHtml += '<input type="text" class="form-control pointForm" id="pointLat" placeholder="Kinh độ">';
                            formBodyHtml += '</div>';
                            formBodyHtml += '<div class="col-12 col-md-6">';
                                formBodyHtml += '<input type="text" class="form-control pointForm" id="pointLong" placeholder="Vĩ độ">';
                            formBodyHtml += '</div>';
                        formBodyHtml += '</div>';
                    formBodyHtml += '</div>';
                formBodyHtml += '</div>';
                formBodyHtml += '<div class="col-12">';
                    formBodyHtml += '<div class="form-group">';
                        formBodyHtml += '<label for="pointDetail">Mô tả</label>';
                        formBodyHtml += '<textarea class="form-control pointForm" id="pointDetail" rows="3" placeholder="Điền mô tả vào đây"></textarea>';
                    formBodyHtml += '</div>';
                formBodyHtml += '</div>';
                formBodyHtml += '<div class="col-12">';
                    formBodyHtml += '<div class="form-group">';
                        formBodyHtml += '<label for="pointNote">Chú thích</label>';
                        formBodyHtml += '<input type="text" class="form-control pointForm" id="pointNote" placeholder="Chú thích điểm">';
                    formBodyHtml += '</div>';
                formBodyHtml += '</div>';

                formBodyHtml += '<div class="col-12">';
                    formBodyHtml += '<div class="form-group">';
                        formBodyHtml += '<label>Hình ảnh</label>';
                        formBodyHtml += '<div class="row prepend-img">';
                            formBodyHtml += '<div class="col-3">';
                                formBodyHtml += '<span class="btn btn-outline-success btn-upload"><span>Thêm</span></span>';
                                formBodyHtml += '<input type="file" name="imgFile" id="imgUpload"/>';
                            formBodyHtml += '</div>';
                        formBodyHtml += '</div>';
                    formBodyHtml += '</div>';
                formBodyHtml += '</div>';

            formBodyHtml += '</div>';
        formBodyHtml += '</form>';
    $('#form-body').html(formBodyHtml);

    /*Build form footer*/
    var formFooter = '<button type="button" class="btn btn-outline-danger" data-dismiss="modal">Hủy</button>';
        formFooter += '<button type="button" class="btn btn-outline-success" id="addPoint">Đồng ý</button>';
        formFooter += '<button type="button" class="btn btn-outline-success" id="editPoint" style="display: none">Cập nhật</button>';

    $('#form-footer').html(formFooter);
}