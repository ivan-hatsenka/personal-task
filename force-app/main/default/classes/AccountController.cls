public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account WHERE Id IN (SELECT Account__c FROM Order__c) ORDER BY Name];
    }

    @AuraEnabled(cacheable=true)
    public static List<Integer> getOrderMonths(String accountId) {
        Set<Integer> uniqueMonths = new Set<Integer>();
        if (String.isNotBlank(accountId)) {
            List<Order__C> orders = [SELECT Payment_Due_date__c FROM Order__c WHERE Account__c = :accountId];
            for (Order__c order : orders) {
                Date orderDate = order.Payment_Due_date__c;
                Integer monthNumber = orderDate.month();
                uniqueMonths.add(monthNumber);
                if(uniqueMonths.size() == 12){
                    break;
                }
            }
        }
        List<Integer> months = new List<Integer>(uniqueMonths);
        months.sort();
        return months;
    }
}