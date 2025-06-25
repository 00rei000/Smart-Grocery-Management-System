from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Recipes, MealPlan
from .serializers import RecipeSerializer, MealPlanSerializer
from django.db.models import Q
from datetime import datetime
from rest_framework.pagination import PageNumberPagination
import os
from django.conf import settings

@api_view(['GET'])
def recipe_list(request):
    """
    Lấy danh sách tất cả công thức, hỗ trợ tìm kiếm và phân trang.
    Query: ?search=...&page=1&page_size=10
    """
    try:
        search_query = request.query_params.get('search', None)
        recipes = Recipes.objects.only("title", "ingredients", "instructions")
        if search_query:
            recipes = recipes.filter(
                Q(title__icontains=search_query) |
                Q(ingredients__icontains=search_query) |
                Q(instructions__icontains=search_query)
            )

        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_recipes = paginator.paginate_queryset(recipes, request)
        serializer = RecipeSerializer(paginated_recipes, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        return Response(
            {"error": f"Không thể lấy danh sách công thức: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def recipe_detail(request, pk):
    """
    Lấy chi tiết một công thức dựa trên ID.
    """
    try:
        recipe = Recipes.objects.get(pk=pk)
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Recipes.DoesNotExist:
        return Response(
            {"error": "Công thức không tồn tại."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể lấy chi tiết công thức: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def recipe_delete(request, pk):
    """
    Xóa hoàn toàn một công thức khỏi cơ sở dữ liệu dựa trên ID.
    """
    try:
        recipe = Recipes.objects.get(pk=pk)
        recipe_title = recipe.title
        serializer = RecipeSerializer(recipe)
        recipe.delete()
        return Response(
            {
                "message": f"Công thức '{recipe_title}' đã được xóa thành công.",
                "deleted_recipe": serializer.data
            },
            status=status.HTTP_200_OK
        )
    except Recipes.DoesNotExist:
        return Response(
            {"error": "Công thức không tồn tại."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể xóa công thức: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def recipe_create(request):
    """
    Tạo một công thức mới, hỗ trợ upload ảnh.
    """
    try:
        data = request.data.copy()

        # Xử lý upload ảnh nếu có
        if 'image' in request.FILES:
            image = request.FILES['image']
            # Tạo tên file duy nhất (có thể dùng timestamp hoặc title)
            image_name = f"recipe_{int(datetime.now().timestamp())}_{image.name}"
            static_dir = os.path.join(settings.BASE_DIR, 'static', 'images')
            os.makedirs(static_dir, exist_ok=True)
            image_path = os.path.join(static_dir, image_name)
            with open(image_path, 'wb+') as f:
                for chunk in image.chunks():
                    f.write(chunk)
            # Lưu đường dẫn ảnh vào img_url
            data['img_url'] = f"/static/images/{image_name}"

        serializer = RecipeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"Công thức '{serializer.data['title']}' đã được tạo thành công.",
                    "created_recipe": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể tạo công thức: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['PATCH'])
def recipe_update(request, pk):
    """
    Cập nhật một phần thông tin của một công thức dựa trên ID, hỗ trợ upload ảnh.
    """
    try:
        recipe = Recipes.objects.get(pk=pk)
        data = request.data.copy()

        # Xử lý upload ảnh nếu có
        if 'image' in request.FILES:
            image = request.FILES['image']
            image_name = f"recipe_{pk}_{image.name}"
            static_dir = os.path.join(settings.BASE_DIR, 'static', 'images')
            os.makedirs(static_dir, exist_ok=True)
            image_path = os.path.join(static_dir, image_name)
            with open(image_path, 'wb+') as f:
                for chunk in image.chunks():
                    f.write(chunk)
            # Lưu đường dẫn ảnh vào img_url
            data['img_url'] = f"/static/images/{image_name}"

        serializer = RecipeSerializer(recipe, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"Công thức '{serializer.data['title']}' đã được cập nhật thành công.",
                    "updated_recipe": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Recipes.DoesNotExist:
        return Response(
            {"error": "Công thức không tồn tại."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể cập nhật công thức: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def meal_plan_list(request):
    """
    Lấy danh sách tất cả kế hoạch bữa ăn, hỗ trợ tìm kiếm theo ngày hoặc loại bữa ăn.
    Query parameter: ?date=YYYY-MM-DD hoặc ?meal_type=<type>
    """
    try:
        date_query = request.query_params.get('date', None)
        meal_type_query = request.query_params.get('meal_type', None)
        
        meal_plans = MealPlan.objects.all()
        if date_query:
            try:
                date_obj = datetime.strptime(date_query, '%Y-%m-%d').date()
                meal_plans = meal_plans.filter(date=date_obj)
            except ValueError:
                return Response(
                    {"error": "Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if meal_type_query:
            meal_plans = meal_plans.filter(meal_type__icontains=meal_type_query)
        
        serializer = MealPlanSerializer(meal_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"Không thể lấy danh sách kế hoạch bữa ăn: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def meal_plan_detail(request, pk):
    """
    Lấy chi tiết một kế hoạch bữa ăn dựa trên ID.
    """
    try:
        meal_plan = MealPlan.objects.get(pk=pk)
        serializer = MealPlanSerializer(meal_plan)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except MealPlan.DoesNotExist:
        return Response(
            {"error": "Kế hoạch bữa ăn không tồn tại."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể lấy chi tiết kế hoạch bữa ăn: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def meal_plan_create(request):
    """
    Tạo một kế hoạch bữa ăn mới.
    Payload ví dụ: {"date": "2025-05-26", "day_of_week": "Monday", "meal_type": "Lunch", "recipe_id": 1}
    """
    try:
        serializer = MealPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"Kế hoạch bữa ăn cho {serializer.data['meal_type']} vào ngày {serializer.data['date']} đã được tạo.",
                    "created_meal_plan": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể tạo kế hoạch bữa ăn: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['PATCH'])
def meal_plan_update(request, pk):
    """
    Cập nhật một phần thông tin của kế hoạch bữa ăn dựa trên ID.
    """
    try:
        meal_plan = MealPlan.objects.get(pk=pk)
        serializer = MealPlanSerializer(meal_plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"Kế hoạch bữa ăn cho {serializer.data['meal_type']} vào ngày {serializer.data['date']} đã được cập nhật.",
                    "updated_meal_plan": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    except MealPlan.DoesNotExist:
        return Response(
            {"error": "Kế hoạch bữa ăn không tồn tại."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể cập nhật kế hoạch bữa ăn: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def meal_plan_delete(request, pk):
    """
    Xóa một kế hoạch bữa ăn dựa trên ID.
    """
    try:
        meal_plan = MealPlan.objects.get(pk=pk)
        meal_plan_info = f"{meal_plan.meal_type} on {meal_plan.date}"
        serializer = MealPlanSerializer(meal_plan)
        meal_plan.delete()
        return Response(
            {
                "message": f"Kế hoạch bữa ăn '{meal_plan_info}' đã được xóa thành công.",
                "deleted_meal_plan": serializer.data
            },
            status=status.HTTP_200_OK
        )
    except MealPlan.DoesNotExist:
        return Response(
            {"error": "Kế hoạch bữa ăn không tồn tại."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Không thể xóa kế hoạch bữa ăn: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
