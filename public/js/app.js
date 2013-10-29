$(function () {
    var table = $('table');

    table.dataTable({
        aLengthMenu: [5, 10, 20],
        aoColumns: [
            {
                mDataProp: 'image'
            },
            {
                mDataProp: 'title'
            },
            {
                mDataProp: 'author'
            },
            {
                mDataProp: 'number'
            },
            {
                mDataProp: 'publicationDate'
            }
        ],
        bFilter: false,
        bServerSide: true,
        fnDrawCallback: function (oSettings) {
            var tableBodyRows = $('table > tbody > tr');

            $.each(tableBodyRows, function () {
                var tableCell = $(this).find('td:eq(0)'),
                    imageUrl = tableCell.text();

                tableCell
                    .addClass('text-center')
                    .html('<img src="' + imageUrl + '" width="75" />');
            });
        },
        iDisplayLength: 5,
        sAjaxSource: '/books',
        sPaginationType: 'full_numbers'
    });
});
