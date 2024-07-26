public with sharing class OrderController {
    @AuraEnabled(cacheable=true)
    public static List<Order__c> getOrders() {
        return [SELECT Id, Name, Total_Amount__c, Payment_Due_date__c, Account__c FROM Order__c ORDER BY Name];
    }
}
