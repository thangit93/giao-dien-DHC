var baseApi = 'http://dhc.api/';
$(document).ready(function () {
    $('.btn-upload').click(function () {
        var numberImg = $('.selectImg').length;
        if(numberImg < 3) {
            $('#imgUpload').click();
        } else {
            alert('Không chọn quá 3 ảnh');
        }
    });

    $('#imgUpload').change(function(){
        UploadImage();
    });

    /*Add Point*/
    $('#addPoint').click(function () {
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
        $.ajax({
            type: 'POST',
            url: baseApi + 'point/delete-point',
            dataType: 'json',
            data: JSON.stringify({
                point_id: pointId,
            }),
            success: function () {
                getListPoint();
            },
            error: function () {
                alert('Có lỗi');
            }
        });
    })
});

/*Upload image ajax*/
function UploadImage() {
    var form = new FormData($("#pointForm")[0]);
    $.ajax({
        type: 'POST',
        url: 'http://dhc.api/point/upload-image',
        data: form,
        processData: false,
        contentType: false,
        cache: false,
        success: function (data) {
            var previewImg = '<div class="col-3">';
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