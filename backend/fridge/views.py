from django.db.utils import IntegrityError, ProgrammingError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Food, Category
from .serializers import FoodSerializer, CategorySerializer
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@api_view(['GET'])
def food_list(request, compartment='cooler'):
    """
    Lấy danh sách thực phẩm theo ngăn (compartment) với trạng thái hết hạn, khớp chính xác với giá trị nhập.
    """
    if request.method == 'GET':
        foods = Food.objects.filter(compartment=compartment)

        # Tìm kiếm theo nhiều trường
        search_query = request.GET.get('search', None)
        if search_query:
            try:
                # Chuyển đổi search_query thành chuỗi để tìm kiếm
                search_number = str(search_query)

                # Tìm kiếm trong các thành phần ngày
                date_filter = (
                    Q(registered_date__day__contains=search_number) |
                    Q(registered_date__month__contains=search_number) |
                    Q(registered_date__year__contains=search_number) |
                    Q(expiry_date__day__contains=search_number) |
                    Q(expiry_date__month__contains=search_number) |
                    Q(expiry_date__year__contains=search_number)
                )

                # Tìm kiếm trong quantity bằng cách chuyển quantity thành chuỗi
                quantity_filter = Q(quantity__contains=search_number)

                # Tìm kiếm trên các trường văn bản, số lượng, và ngày
                foods = foods.filter(
                    Q(name__icontains=search_query) |
                    Q(category__name__icontains=search_query) |
                    Q(location__icontains=search_query) |
                    Q(note__icontains=search_query) |
                    quantity_filter |
                    date_filter
                )
            except ValueError:
                logger.warning(f"Search query không hợp lệ: {search_query}")
                return Response(
                    {'status': 'error', 'message': 'Search query không hợp lệ.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Lọc theo số lượng (quantity) nếu có
        quantity = request.GET.get('quantity', None)
        if quantity:
            try:
                foods = foods.filter(quantity=int(quantity))  # Khớp chính xác với quantity
            except ValueError:
                logger.warning(f"Định dạng quantity không hợp lệ: {quantity}")
                return Response(
                    {'status': 'error', 'message': 'Định dạng quantity không hợp lệ.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Lọc theo ngày đăng ký (registered_date) nếu có
        registered_date = request.GET.get('registered_date', None)
        if registered_date:
            try:
                registered_date = datetime.strptime(registered_date, '%Y-%m-%d').date()
                foods = foods.filter(registered_date=registered_date)  # Khớp chính xác với registered_date
            except ValueError:
                logger.warning(f"Định dạng registered_date không hợp lệ: {registered_date}")
                return Response(
                    {'status': 'error', 'message': 'Định dạng registered_date không hợp lệ.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Lọc theo ngày hết hạn (expiry_date) nếu có
        expiry_date = request.GET.get('expiry_date', None)
        if expiry_date:
            try:
                expiry_date = datetime.strptime(expiry_date, '%Y-%m-%d').date()
                foods = foods.filter(expiry_date=expiry_date)  # Khớp chính xác với expiry_date
            except ValueError:
                logger.warning(f"Định dạng expiry_date không hợp lệ: {expiry_date}")
                return Response(
                    {'status': 'error', 'message': 'Định dạng expiry_date không hợp lệ.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Thêm thông tin trạng thái hết hạn
        today = datetime.now().date()
        serializer = FoodSerializer(foods, many=True)
        data = []
        for item in serializer.data:
            expiry_date = datetime.strptime(item['expiry_date'], '%Y-%m-%d').date()
            days_diff = (today - expiry_date).days
            expiry_status = None
            status_color = None

            if expiry_date < today:  # Quá thời hạn
                expiry_status = f"D+{days_diff}"
                status_color = "red"
            elif expiry_date == today:  # Hết hạn ngay hôm nay
                expiry_status = "D-Day"
                status_color = "orange"
            elif expiry_date > today:  # Còn hạn
                days_left = (expiry_date - today).days
                expiry_status = f"D-{days_left}"
                status_color = "green"

            data.append({
                **item,
                'expiry_status': expiry_status,
                'status_color': status_color
            })

        return Response({
            'foods': data
        })
# Thêm thực phẩm
@api_view(['POST'])
def add_food(request):
    serializer = FoodSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(
                {'status': 'success', 'message': 'Thực phẩm đã được thêm.', 'data': serializer.data},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {'status': 'error', 'message': 'Dữ liệu không hợp lệ, có thể thực phẩm đã tồn tại.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ProgrammingError as e:
            return Response(
                {'status': 'error', 'message': f'Lỗi cơ sở dữ liệu: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(
        {'status': 'error', 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )

# Cập nhật thực phẩm
@api_view(['PUT', 'PATCH'])
def update_food(request, food_id):
    """
    Cập nhật thông tin một mục thực phẩm.
    """ 
    print(f"Request method: {request.method}")
    try:
        food = Food.objects.get(id=food_id)
    except Food.DoesNotExist:
        logger.error(f"Thực phẩm {food_id} không tồn tại")
        return Response(
            {'status': 'error', 'message': 'Thực phẩm không tồn tại.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    print(f"Request data: {request.data}")
    
    serializer = FoodSerializer(food, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        print(f"Serializer data: {serializer.validated_data}")
        serializer.save()
        logger.info(f"Thực phẩm {food_id} đã được cập nhật")
        return Response(
            {'status': 'success', 'message': 'Thực phẩm đã được cập nhật.', 'data': serializer.data}
        )
    logger.warning(f"Serializer errors: {serializer.errors}")
    return Response(
        {'status': 'error', 'errors': serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )

# Xóa thực phẩm
@api_view(['DELETE'])
def delete_food(request, food_id):
    """
    Xóa một mục thực phẩm.
    """
    try:
        food = Food.objects.get(id=food_id)
        food.delete()
        logger.info(f"Thực phẩm {food_id} đã được xóa")
        return Response(
            {'status': 'success', 'message': 'Thực phẩm đã được xóa.'},
            status=status.HTTP_204_NO_CONTENT
        )
    except Food.DoesNotExist:
        logger.error(f"Thực phẩm {food_id} không tồn tại")
        return Response(
            {'status': 'error', 'message': 'Thực phẩm không tồn tại.'},
            status=status.HTTP_404_NOT_FOUND
        )

# Thêm danh mục
@api_view(['POST'])
def add_category(request):
    """
    Thêm một danh mục mới.
    """
    if request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        try:
            if serializer.is_valid():
                serializer.save()
                logger.info("Danh mục đã được thêm thành công")
                return Response(
                    {'status': 'success', 'message': 'Danh mục đã được thêm.', 'data': serializer.data},
                    status=status.HTTP_201_CREATED
                )
            logger.warning(f"Serializer errors: {serializer.errors}")
            return Response(
                {'status': 'error', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError:
            logger.warning("Tên danh mục đã tồn tại")
            return Response(
                {'status': 'error', 'message': 'Tên danh mục đã tồn tại.'},
                status=status.HTTP_400_BAD_REQUEST
            )