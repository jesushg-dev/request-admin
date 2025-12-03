#!/bin/bash

# Uso: ./test-api.sh [tenantId] [apiKey]

# API Key (puede ser sobrescrito por argumento)
API_KEY="${2:-appHpOYfbwxXEhpbjgZXvDNDfPGYApeFHnFLAENeFZqpEGuOOsytaBVGddBqhpyYUdz}"

# Base URL (ajusta según tu entorno)
BASE_URL="http://localhost:3000"
# BASE_URL="https://your-domain.com"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing API with API Key ===${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}API Key: ${API_KEY:0:20}...${NC}"
echo ""

# Función helper para hacer peticiones
make_request() {
  local url=$1
  local response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $API_KEY" \
    "$url")
  
  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo "$body"
    return 0
  else
    echo "Error: HTTP $http_code" >&2
    echo "$body" >&2
    return 1
  fi
}

# 1. Verificar que la API key funciona (obtener tenant asociado)
echo -e "${GREEN}1. Verifying API key and getting associated tenant...${NC}"

# Intentar diferentes variantes de URL
URLS=(
  "$BASE_URL/api/tenants"
  "$BASE_URL/en/api/tenants"
  "$BASE_URL/es/api/tenants"
)

TENANTS_RESPONSE=""
WORKING_URL=""

for url in "${URLS[@]}"; do
  echo -e "${GRAY}  Trying: $url${NC}"
  response=$(make_request "$url" 2>&1)
  
  if [ $? -eq 0 ]; then
    TENANTS_RESPONSE="$response"
    WORKING_URL=$(echo "$url" | sed 's|/api/tenants||')
    echo -e "${GREEN}  ✓ Success!${NC}"
    break
  else
    echo -e "${YELLOW}  ✗ Failed${NC}"
  fi
done

if [ -z "$TENANTS_RESPONSE" ]; then
  echo ""
  echo -e "${RED}Error: Could not connect to API. Make sure:${NC}"
  echo -e "${RED}  1. The server is running (npm run dev)${NC}"
  echo -e "${RED}  2. The server is accessible at $BASE_URL${NC}"
  echo -e "${RED}  3. The API key is valid and associated with a tenant${NC}"
  exit 1
fi

echo "$TENANTS_RESPONSE" | jq '.' 2>/dev/null || echo "$TENANTS_RESPONSE"
echo ""

# La API key ya está asociada a un tenant, no necesitamos especificarlo
echo -e "${GREEN}API key is scoped to tenant automatically${NC}"
echo ""

# 2. Listar formularios (tenantId ya está incluido en la API key)
echo -e "${GREEN}2. Getting forms...${NC}"
FORMS_RESPONSE=$(make_request "$WORKING_URL/api/forms" 2>&1)

if [ $? -eq 0 ]; then
  echo "$FORMS_RESPONSE" | jq '.' 2>/dev/null || echo "$FORMS_RESPONSE"
  echo ""
else
  echo -e "${RED}  ✗ Error${NC}"
  FORMS_RESPONSE=""
  echo ""
fi

# 3. Obtener menu items (tenantId ya está incluido en la API key)
echo -e "${GREEN}3. Getting menu items...${NC}"
MENU_ITEMS_RESPONSE=$(make_request "$WORKING_URL/api/menu-items" 2>&1)

if [ $? -eq 0 ]; then
  echo "$MENU_ITEMS_RESPONSE" | jq '.' 2>/dev/null || echo "$MENU_ITEMS_RESPONSE"
  echo ""
else
  echo -e "${RED}  ✗ Error${NC}"
  echo ""
fi

# Si hay formularios, obtener el primero
FIRST_FORM_ID=$(echo "$FORMS_RESPONSE" | jq -r '.data[0].id' 2>/dev/null)

if [ -n "$FIRST_FORM_ID" ] && [ "$FIRST_FORM_ID" != "null" ]; then
  echo -e "${GREEN}4. Getting form details (ID: $FIRST_FORM_ID)...${NC}"
  FORM_DETAILS_RESPONSE=$(make_request "$WORKING_URL/api/forms/$FIRST_FORM_ID" 2>&1)
  
  if [ $? -eq 0 ]; then
    echo "$FORM_DETAILS_RESPONSE" | jq '.' 2>/dev/null || echo "$FORM_DETAILS_RESPONSE"
    echo ""
  else
    echo -e "${RED}  ✗ Error${NC}"
    echo ""
  fi

  echo -e "${GREEN}5. Getting form submissions (ID: $FIRST_FORM_ID)...${NC}"
  SUBMISSIONS_RESPONSE=$(make_request "$WORKING_URL/api/forms/$FIRST_FORM_ID/submissions" 2>&1)
  
  if [ $? -eq 0 ]; then
    echo "$SUBMISSIONS_RESPONSE" | jq '.' 2>/dev/null || echo "$SUBMISSIONS_RESPONSE"
    echo ""
  else
    echo -e "${RED}  ✗ Error${NC}"
    echo ""
  fi
else
  echo -e "${YELLOW}4. Skipping form details (no forms found)${NC}"
  echo -e "${YELLOW}5. Skipping form submissions (no forms found)${NC}"
  echo ""
fi

echo -e "${BLUE}=== Test completed ===${NC}"

